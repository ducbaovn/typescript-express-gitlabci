/**
 * Created by davidho on 2/14/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {SessionModel, ExceptionModel, StateModel, FeedbackModel, FeedbackCategoryModel, FeedbackReplyModel} from "../../../../models";
import {ROLE, PROPERTIES} from "../../../../libs/constants";
import {ErrorCode, HttpStatus} from "../../../../libs/index";
import {FeedbackService, UserService, FeedbackReplyService} from "../../../../interactors/index";

export class FeedbackHandler extends BaseHandler {
//
//  FEEDBACK CATEGORY REGION
//

    public static listCategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId || null;
        let roleId = session.roleId || null;
        let params = req.query || {};

        return Promise.resolve()
            .then(() => {
                if (!params.condoId) {
                    return UserService.findOne(userId, ["condo", "condoManager"])
                    .then(user => {
                        params.condoId = roleId === ROLE.CONDO_MANAGER ? user.condoManager.id : user.condo.id;
                    });
                }
            })
            .then(() => {
                return FeedbackService.searchFeedbackCategory(params, [], ["isDeleted", "isEnable"]);
            })
            .then((object) => {
                res.header(PROPERTIES.HEADER_TOTAL, object.total.toString());
                if (params.offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, params.offset.toString(10));
                }
                if (params.limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, params.limit.toString(10));
                }
                res.status(HttpStatus.OK);
                res.json(object.data);
            })
            .catch(err => {
                next(err);
            });
    }

    public static detailCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();

        return FeedbackService.findOne(req.params.id)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    public static createCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let feedbackCategory = FeedbackCategoryModel.fromRequest(req);

        return FeedbackService.createFeedbackCategory(feedbackCategory)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful(object.id));
            })
            .catch(err => {
                next(err);
            });
    }

    public static updateCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let feedbackCategory = FeedbackCategoryModel.fromRequest(req);
        feedbackCategory.id = req.params.id || "";

        return FeedbackService.updateFeedbackCategory(feedbackCategory)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(object.id));
            })
            .catch(err => {
                next(err);
            });
    }

    public static deleteCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let categoryId = req.params.id || "";

        return FeedbackService.deleteFeedbackCategory(categoryId)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }

    public static resetCounterFirebase(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return FeedbackService.resetCounterFeedbackPendingFirebase()
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
//
//  FEEDBACK REGION
//

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let roleId = session.roleId;
        let queryParams = req.query || {};

        return Promise.resolve()
        .then(() => {
            if (roleId === ROLE.CONDO_MANAGER) {
                return UserService.findOne(userId, ["condoManager"])
                .then(user => {
                    queryParams.condoId = user.condoManager.id;
                });
            } else {
                queryParams.userId = userId;
            }
        })
        .then(() => {
            return FeedbackService.search(queryParams, ["user", "condo", "unit.floor.block", "category", "resolveBy"], ["isDeleted", "role"]);
        })
        .then(result => {
            return Promise.each(result.data, (feedback => {
                return FeedbackService.isNew(feedback.id, userId)
                .then(isNew => {
                    feedback.isNew = isNew;
                });
            }))
            .then(() => {
                res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));
                if (queryParams.offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, queryParams.offset.toString(10));
                }
                if (queryParams.limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, queryParams.limit.toString(10));
                }
                res.status(HttpStatus.OK);
                res.json(result.data);
            });
        })
        .catch(err => {
            next(err);
        });
    }

    public static detail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return FeedbackService.findOne(req.params.id, ["user", "unit.floor.block", "condo", "category"], ["isDeleted", "role"])
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId || null;
        let feedback = FeedbackModel.fromRequest(req);
        feedback.userId = userId;

        return Promise.resolve()
        .then(() => {
            return UserService.findOne(userId, ["condo", "unit"])
            .then(user => {
                feedback.unitId = user.unit.id;
                feedback.condoId = user.condo.id;
                return FeedbackService.genTicketNumber(feedback.condoId, user.condo.mcstNumber);
            });
        })
        .then(ticketNumber => {
            feedback.ticketNumber = ticketNumber;
            return FeedbackService.create(feedback);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let feedback = FeedbackModel.fromRequest(req);
        feedback.id = req.params.id || "";

        return FeedbackService.update(feedback)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(object.id));
            })
            .catch(err => {
                next(err);
            });
    }

    public static resolve(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let feedbackId = req.params.id || "";

        return FeedbackService.resolve(feedbackId, userId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(feedbackId));
            })
            .catch(err => {
                next(err);
            });
    }

    public static reopen(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let feedbackId = req.params.id || "";

        return FeedbackService.reopen(feedbackId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(feedbackId));
            })
            .catch(err => {
                next(err);
            });
    }

    public static read(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let feedbackId = req.params.id || "";

        return FeedbackService.updateReadFeedback(feedbackId, userId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(feedbackId));
            })
            .catch(err => {
                next(err);
            });
    }

    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let feedbackId = req.params.id || "";

        return FeedbackService.delete(feedbackId)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }

    public static listReply(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let roleId = session.roleId;
        let feedbackId = req.params.id || "";
        let queryParams = req.query || {};
        queryParams.feedbackId = feedbackId;

        return Promise.resolve()
        .then(() => {
            return FeedbackReplyService.search(queryParams, ["user", "feedback"], ["isDeleted", "role"]);
        })
        .then(result => {
            res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));
            if (queryParams.offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, queryParams.offset.toString(10));
            }
            if (queryParams.limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, queryParams.limit.toString(10));
            }
            res.status(HttpStatus.OK);
            res.json(result.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static detailReply(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();

        return FeedbackReplyService.findOne(req.params.id)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    public static createReply(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId || null;
        let feedbackId = req.params.id || "";
        let reply = FeedbackReplyModel.fromRequest(req);
        reply.feedbackId = feedbackId;

        return FeedbackReplyService.create(reply)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteReply(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let replyId = req.params.id || "";

        return FeedbackReplyService.delete(replyId)
        .then((object) => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }
}

export default FeedbackHandler;
