import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import * as momentTz from "moment-timezone";
import * as firebase from "firebase-admin";
import * as _ from "lodash";
import {BaseService} from "./base.service";
import {CollectionWrap, FeedbackReplyModel, FeedbackModel, ExceptionModel, FeedbackCategoryModel} from "../models";
import {FeedbackReplyRepository, FeedbackRepository} from "../data";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Mailer } from "../libs";
import {TIME_ZONE, DELETE_STATUS, ENABLE_STATUS, INBOX_TYPE, MOMENT_DATE_FORMAT, REPORT, REPORT_KEY, FEEDBACK_REPLY_STATUS, ROLE} from "../libs/constants";
import {FeedbackReplyDto} from "../data/sql/models";
import {UserManagerService, CondoService, FeedbackService, PushNotificationService} from "../interactors";
import Redis from "../data/redis/redis";

export class FeedbackReplyService extends BaseService<FeedbackReplyModel, typeof FeedbackReplyRepository> {
    constructor() {
        super(FeedbackReplyRepository);
    }

    public search(searchParams: any, related = [], filters = []): Promise<CollectionWrap<FeedbackReplyModel>> {
        return FeedbackReplyRepository.search(searchParams, related, filters);
    }

    public create(reply: FeedbackReplyModel): Promise<FeedbackReplyModel> {
        if (!reply.feedbackId || (!reply.content && (!reply.images || (reply.images && reply.images.length === 0)))) {
            throw new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            );
        }
        return FeedbackReplyRepository.insert(reply)
            .then(object => {
                return FeedbackReplyRepository.findOne(object.id, ["user", "feedback.condo.manager"]);
            })
            .tap(reply => {
                let feedback = reply.feedback;
                feedback.updatedDate = momentTz.tz(new Date(), "UTC");
                return FeedbackRepository.update(feedback);
            })
            .tap(reply => {
                FeedbackService.refreshReadFeedback(reply.feedbackId, reply.userId);
            })
            .tap(reply => {
                this.updateFeedbackReplyFirebase(reply)
                    .catch(err => Logger.error(err.message, err));
            })
            .tap(reply => {
                if (reply.user.roleId !== ROLE.CONDO_MANAGER) {
                    // Update New Feedback For Condo Manager on Firebase
                    Promise.each(reply.feedback.condo.manager, (userManager => {
                        return FeedbackService.updateNewFeedbackFirebaseForUser(userManager.id)
                            .catch(err => Logger.error(err.message, err));
                    }));
                } else if (reply.user.roleId === ROLE.CONDO_MANAGER) {
                    PushNotificationService.newFeedbackReply(reply.feedback);
                    // Update New Feedback For User on Firebase
                    FeedbackService.updateNewFeedbackFirebaseForUser(reply.feedback.userId);
                        // Update New Feedback For other Condo Manager on Firebase
                    Promise.each(reply.feedback.condo.manager, (userManager => {
                        if (userManager.id !== reply.userId) {
                            return FeedbackService.updateNewFeedbackFirebaseForUser(userManager.id)
                                .catch(err => Logger.error(err.message, err));
                        }
                    }));
                }
            });
    }

    public delete(id: string): Promise<any> {
        return FeedbackReplyRepository.deleteLogic(id);
    }

    public updateFeedbackReplyFirebase(feedbackReplyModel: FeedbackReplyModel) {
        let fb = FirebaseAdmin.getInstance();
        return Promise.resolve()
        .then(() => {
            return fb.database().ref("feedbackReply")
                .child(feedbackReplyModel.feedbackId)
                .update({
                    id: feedbackReplyModel.id || "",
                    userId: feedbackReplyModel.user.id || "",
                    userAvatar: feedbackReplyModel.user.avatarUrl || "",
                    userFirstName: feedbackReplyModel.user.firstName || "",
                    userLastName: feedbackReplyModel.user.lastName || "",
                    createdDate: feedbackReplyModel.createdDate.utc().toISOString(),
                    title: feedbackReplyModel.feedback.title || "",
                    content: feedbackReplyModel.content || "",
                    images: feedbackReplyModel.images
                }).catch(err => Logger.error(err.message, err));
        });
    }

    /**
     * find by feedbackId
     * @param feedbackId
     * @returns {Promise<FeedbackReplyModel[]>}
     */
    public findByFeedbackId(feedbackId: string) {
        return FeedbackReplyRepository.findByQuery(q => {
            q.where(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID, feedbackId);
        });
    }
}

export default FeedbackReplyService;
