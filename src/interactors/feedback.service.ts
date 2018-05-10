import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import * as momentTz from "moment-timezone";
import * as firebase from "firebase-admin";
import * as _ from "lodash";
import {BaseService} from "./base.service";
import {CollectionWrap, FeedbackModel, ExceptionModel, FeedbackCategoryModel} from "../models";
import {FeedbackCategoryRepository, FeedbackRepository, UserRepository, CondoRepository, FeedbackReplyRepository} from "../data";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Mailer, Utils} from "../libs";
import {TIME_ZONE, DELETE_STATUS, ENABLE_STATUS, INBOX_TYPE, MOMENT_DATE_FORMAT, REPORT, REPORT_KEY, FEEDBACK_STATUS, ROLE} from "../libs/constants";
import {FeedbackDto} from "../data/sql/models";
import {UserManagerService, PushNotificationService} from "../interactors";
import Redis from "../data/redis/redis";

export class FeedbackService extends BaseService<FeedbackModel, typeof FeedbackRepository> {
    constructor() {
        super(FeedbackRepository);
    }

//
//  FEEDBACK CATEGORY REGION
//

    public searchFeedbackCategory(searchParams: any, related = [], filters = []): Promise<CollectionWrap<FeedbackCategoryModel>> {
        return FeedbackCategoryRepository.search(searchParams, related, filters);
    }

    public createFeedbackCategory(feedbackCategory: FeedbackCategoryModel): Promise<any> {
        return Promise.resolve()
        // check exist feedback category name
        .then(() => {
            if (!feedbackCategory.condoId || !feedbackCategory.name) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            let query = {
                condoId: feedbackCategory.condoId,
                name: feedbackCategory.name
            };
            return FeedbackCategoryRepository.list(query);
        })
        .then(categories => {
            if (categories[0] && categories[0].id !== feedbackCategory.id) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.CODE,
                    ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return FeedbackCategoryRepository.insert(feedbackCategory);
        });
    }

    public updateFeedbackCategory(feedbackCategory: FeedbackCategoryModel): Promise<any> {
        return Promise.resolve()
        .then(() => {
            if (!feedbackCategory.id || !feedbackCategory.condoId || !feedbackCategory.name) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            let query = {
                condoId: feedbackCategory.condoId,
                name: feedbackCategory.name
            };
            return FeedbackCategoryRepository.list(query);
        })
        .then(categories => {
            if (categories[0] && categories[0].id !== feedbackCategory.id) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.CODE,
                    ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return FeedbackCategoryRepository.update(feedbackCategory);
        });
    }

    public deleteFeedbackCategory(id: string): Promise<any> {
        return FeedbackCategoryRepository.deleteLogic(id);
    }

//
//  FEEDBACK REGION
//

    public search(searchParams: any, related = [], filters = []): Promise<CollectionWrap<FeedbackModel>> {
        return FeedbackRepository.search(searchParams, related, filters);
    }

    public create(feedbackModel: FeedbackModel): Promise<FeedbackModel> {
        return FeedbackRepository.insert(feedbackModel)
            .then(object => {
                return FeedbackRepository.findOne(object.id, ["condo.manager", "user.unit.floor.block", "category"]);
            })
            .tap(feedback => {
                // New feedback received to condo manager and category email
                Mailer.sendNewFeedbackReceived(feedback)
                    .catch(err => Logger.error(err.message, err));
                // Feedback Received - Thank You to user
                Mailer.sendFeedbackReceivedThankYou(feedback)
                    .catch(err => Logger.error(err.message, err));
            })
            .tap(feedback => {
                // update read feedback for user
                this.updateReadFeedback(feedback.id, feedback.userId);
            })
            .tap(feedback => {
                // Update New Feedback For Condo Manager on Firebase
                Promise.each(feedback.condo.manager, (userManager => {
                    return this.updateNewFeedbackFirebaseForUser(userManager.id)
                        .catch(err => Logger.error(err.message, err));
                }));
            })
            .tap((feedback) => {
                // Counter the new feedback, support for Condo Manager.
                this.updateCounterFeedback(feedback.condoId)
                    .catch(err => Logger.error(err.message, err));
            });
    }

    public update(feedback: FeedbackModel): Promise<any> {
        return FeedbackRepository.update(feedback);
    }

    public resolve(id: string, userId: string): Promise<any> {
        let feedback = new FeedbackModel();
        feedback.id = id;
        feedback.status = FEEDBACK_STATUS.RESOLVED;
        feedback.resolveBy = userId;
        feedback.dateResolved = momentTz.tz(new Date(), "UTC");

        return FeedbackRepository.update(feedback)
            .then(object => {
                return this.findOne(object.id, ["user", "condo.manager", "category", "replies.user"]);
            })
            .tap(object => {
                Mailer.sendFeedbackResolved(object)
                .catch(err => Logger.error(err.message, err));
            })
            .tap(object => {
                PushNotificationService.updateFeedbackStatus(object);
            })
            .tap(object => {
                // Decrease the feedback counter on firebase.
                this.updateCounterFeedback(object.condoId, false)
                    .catch(err => Logger.error(err.message, err));
            })
            .tap(object => {
                Redis.getClient().delAsync(Redis.getFeedbackReadersKey(object.id))
                    .catch(err => Logger.error(err.message, err));
            })
            .tap(object => {
                let reminderUsers = [object.userId];
                object.condo.manager.forEach(manager => {
                    if (manager.id !== userId) {
                        reminderUsers.push(manager.id);
                    }
                });
                Promise.each(reminderUsers, (id => {
                    this.updateNewFeedbackFirebaseForUser(id);
                }));
            });
    }

    public reopen(id: string): Promise<any> {
        let feedback = new FeedbackModel();
        feedback.id = id;
        feedback.status = FEEDBACK_STATUS.PENDING;

        return FeedbackRepository.update(feedback)
            .then(object => {
                return this.findOne(object.id, ["user", "condo.manager", "category"]);
            })
            .tap(object => {
                PushNotificationService.updateFeedbackStatus(object);
            })
            .tap(object => {
                // Increase the feedback counter on firebase.
                this.updateCounterFeedback(object.condoId, true)
                    .catch(err => Logger.error(err.message, err));
            })
            .tap(object => {
                let reminderUsers = [object.userId];
                object.condo.manager.forEach(manager => {
                    reminderUsers.push(manager.id);
                });
                Promise.each(reminderUsers, (userId => {
                    this.updateNewFeedbackFirebaseForUser(userId);
                }));
            });
    }

    public delete(id: string): Promise<any> {
        return FeedbackRepository.deleteLogic(id);
    }


    public genTicketNumber(condoId: string, mcstNumber: string) {
        return Promise.resolve()
        .then(() => {
            if (!condoId || !mcstNumber) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.CONDO_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return FeedbackRepository.getMaxTicketNumber(condoId);
        })
        .then(maxTicketNumber => {
            let year = new Date().getFullYear() % 100;
            let orderNumber: number;
            orderNumber = maxTicketNumber == null || parseInt(maxTicketNumber.slice(-8, -6)) < year ? year * 1000000 : parseInt(maxTicketNumber.slice(-8));
            orderNumber++;
            return "" + mcstNumber + orderNumber;
        });
    }

    public updateReadFeedback(feedbackId: string, userId: string): Promise<any> {
        return this.findOne(feedbackId)
        .then(feedback => {
            if (feedback.status === FEEDBACK_STATUS.PENDING) {
                let readersKey = Redis.getFeedbackReadersKey(feedbackId);
                return Redis.getClient().saddAsync(readersKey, userId);
            }
        });
    }

    public refreshReadFeedback(feedbackId: string, userId: string): Promise<any> {
        let readersKey = Redis.getFeedbackReadersKey(feedbackId);
        let multi = Redis.getClient().multi();
        multi.del(readersKey);
        multi.sadd(readersKey, userId);
        return multi.execAsync();
    }

    public isNew(feedbackId: string, userId: string): Promise<boolean> {
        let readersKey = Redis.getFeedbackReadersKey(feedbackId);
        return Redis.getClient().sismemberAsync(readersKey, userId)
        .then(isRead => {
            return !isRead;
        });
    }

    private updateCounterFeedback(condoId: string, isIncrease: boolean = true): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
        .then(() => {
            return fb.database().ref(`counter/${condoId}`)
            .once("value")
            .then((dataSnapshot) => {
                let counter = {
                    feedback: 0
                };

                if (dataSnapshot != null && dataSnapshot.val() != null && dataSnapshot.val().feedback != null) {
                    if (isIncrease) {
                        counter.feedback = dataSnapshot.val().feedback + 1;
                    } else {
                        counter.feedback = dataSnapshot.val().feedback > 0 ? dataSnapshot.val().feedback - 1 : 0;
                    }
                } else {
                    if (isIncrease) {
                        counter.feedback = 1;
                    }
                }

                return fb.database().ref("counter").child(`${condoId}`)
                .update(counter);
            });
        })
        .catch(err => err => Logger.error(err.message, err));
    }

    public updateNewFeedbackFirebaseForUser(userId: string) {
        let fb = FirebaseAdmin.getInstance();
        return Promise.resolve()
        .then(() => {
            return fb.database().ref("notification")
                .child(userId)
                .update({
                    isFeedbackNew: true
                }).catch(err => Logger.error(err.message, err));
        });
    }

    public resetCounterFeedbackPendingFirebase() {
        let fb = FirebaseAdmin.getInstance();
        return Promise.resolve()
        .then(() => {
            return CondoRepository.findByQuery(q => {
                q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            });
        })
        .then(condos => {
            return Promise.each(condos, (condo => {
                return FeedbackRepository.countByQuery(q => {
                    q.where(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                    q.where(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS, FEEDBACK_STATUS.PENDING);
                    q.where(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID, condo.id);
                })
                .then(count => {
                    let counter = {
                        feedback: count
                    };
                    return fb.database().ref("counter").child(`${condo.id}`)
                    .update(counter).catch(err => Logger.error(err.message, err));
                });
            }));
        });
    }

//
//  REPORT REGION
//

    public reportByStatus(condoId: string, startDate: string, endDate: string): any {
        let query = `
            SELECT ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS} as key, count(*) as value
            FROM ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}
            WHERE
                ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} >= '${startDate}'
                AND ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} < '${endDate}'
            GROUP BY ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS};
        `;

        return FeedbackRepository.rawQuery(query)
        .then((result) => {
            let countReceived = 0;
            result.forEach(row => {
                row.key = row.key === FEEDBACK_STATUS.PENDING ? REPORT_KEY.FEEDBACK_PENDING : REPORT_KEY.FEEDBACK_RESOLVED;
                countReceived += row.value;
            });
            result.push({
                key: REPORT_KEY.FEEDBACK_RECEIVED,
                value: countReceived
            });
            return result;
        });
    }

    public reportTotalPending(condoId: string): any {
        let query = `
            SELECT '${REPORT_KEY.FEEDBACK_TOTAL_PENDING}' as key, count(*) as value
            FROM ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}
            WHERE
                ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS} = '${FEEDBACK_STATUS.PENDING}';
        `;

        return FeedbackRepository.rawQuery(query);
    }

    public reportByCategory(condoId: string, startDate: string, endDate: string): any {
        let query = `
            SELECT c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME} as key, count(*) as value
            FROM ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} f
            JOIN ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME} c
                ON f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID} = c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
            WHERE
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} >= '${startDate}'
                AND f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} < '${endDate}'
            GROUP BY c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME};
        `;

        return FeedbackRepository.rawQuery(query);
    }

    public trending(condoId: string, timezone = TIME_ZONE.TIME_ZONE_DEFAULT, monthDuration = REPORT.MONTH_DURATION_TRENDING) {
        let report = [];
        let query = `
            SELECT c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}, to_char(f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED}, 'Mon YY') AS month, count(*)
            FROM ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} f JOIN ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME} c
                ON f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID} = c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
            WHERE
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} < now()
                AND date_trunc('month', f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED} at time zone '${timezone}') > date_trunc('month', (now() - interval '${monthDuration - 1} months') at time zone '${timezone}')
            GROUP BY c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}, month
            ORDER BY c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME};
        `;

        return FeedbackRepository.rawQuery(query)
        .then(result => {
            if (result && result.length) {
                let header = ["Month"];
                let groupName = _.groupBy(result, Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME);
                for (let name in groupName) {
                    header.push(name);
                }
                report.push(header);
                for (let i = 0; i < REPORT.MONTH_DURATION_TRENDING; i++) {
                    let monthReport = [];
                    let month = momentTz.tz(new Date(), timezone).subtract(REPORT.MONTH_DURATION_TRENDING - 1 - i, "months").format("MMM YY");
                    monthReport.push(month);
                    for (let name in groupName) {
                        let groupNameMonth = _.groupBy(groupName[name], "month");
                        let count = groupNameMonth[month] ? groupNameMonth[month][0]["count"] : 0;
                        monthReport.push(count);
                    }
                    report.push(monthReport);
                }
            }
            return report;
        });
    }
}

export default FeedbackService;
