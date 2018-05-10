/**
 * Created by davidho on 4/13/17.
 */

import * as express from "express";
import { BaseHandler } from "../base.handler";
import { ENABLE_STATUS, FEED_TYPE, PROPERTIES, ROLE } from "../../../../libs/constants";
import { HttpStatus, ErrorCode } from "../../../../libs/index";
import { FeedService } from "../../../../interactors";
import { SessionModel } from "../../../../models/session.model";
import { FeedModel, ExceptionModel, StateModel } from "../../../../models";
import { FeedLikeModel } from "../../../../models/feed_like.model";
import { FeedCommentModel } from "../../../../models/feed_comment.model";
import { FeedCommentLikeModel } from "../../../../models/feed_comment_like.model";

export class FeedHandler extends BaseHandler {
    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;

            queryParams.userId = session.userId;
            queryParams.roleId = session.roleId;

            return FeedService.search(queryParams, offset, limit, ["user", "user.unit", "condo"], ["isDeleted", "tag"])
                .then(users => {
                    res.header(PROPERTIES.HEADER_TOTAL, users.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }
                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(users.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    public static detailSponsor(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let userId = session.userId;
            let feedId = req.params.id || null;

            return FeedService.detailSponsorAd(feedId, userId)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static view(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let feedId = req.params.id || null;

            return FeedService.findFeedById(feedId, ["user", "user.unit", "condo"], ["isDeleted", "tag"], session.userId)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    /**
     * create(submit) feeds
     * @param req
     * @param res
     * @param next
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let feed = FeedModel.fromRequest(req);

            feed.userId = session.userId;

            if (FeedHandler.checkConstraintField(feed) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (feed.type) {
                case FEED_TYPE.CHATTER_BOX:
                case FEED_TYPE.FIND_A_BUDDY:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            feed.tag = [
                feed.userId,
                feed.condoId,
                session.roleId,
                feed.type
            ];

            return FeedService.create(feed)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.createSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }

    /**
     * update feeds
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {

            let feed = FeedModel.fromRequest(req);

            feed.id = req.params.id || "";

            if (FeedHandler.checkConstraintField(feed) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (feed.type) {
                case FEED_TYPE.CHATTER_BOX:
                case FEED_TYPE.FIND_A_BUDDY:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return FeedService.update(feed)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static like(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let feedId = req.params.feedId || "";
            let likeModel = FeedLikeModel.fromRequest(req);

            likeModel.feedId = feedId;
            likeModel.userId = session.userId;

            if (FeedHandler.checkLikeConstraintField(likeModel) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (likeModel.type) {
                case FEED_TYPE.CHATTER_BOX:
                case FEED_TYPE.FIND_A_BUDDY:
                case FEED_TYPE.SPONSOR_ADS:
                case FEED_TYPE.GARAGE_SALE:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return FeedService.like(likeModel)
                .then(() => {
                    res.status(HttpStatus.OK);

                    if (likeModel.isLike) {
                        res.json(StateModel.likeSuccessful());
                    } else {
                        res.json(StateModel.unLikeSuccessful());
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static listComment(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let feedId = req.params.feedId || null;
            let queryParams = req.query || null;

            queryParams.feedId = feedId;
            queryParams.userId = session.userId;

            return FeedService.searchComment(queryParams, offset, limit, ["user"], ["isDeleted"])
                .then(users => {
                    res.header(PROPERTIES.HEADER_TOTAL, users.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }
                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(users.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static comment(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let feedId = req.params.feedId || "";
            let obj = FeedCommentModel.fromRequest(req);

            obj.feedId = feedId;
            obj.userId = session.userId;

            if (FeedHandler.checkCommentConstraintField(obj) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (obj.type) {
                case FEED_TYPE.CHATTER_BOX:
                case FEED_TYPE.FIND_A_BUDDY:
                case FEED_TYPE.SPONSOR_ADS:
                case FEED_TYPE.GARAGE_SALE:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return FeedService.comment(obj, ["user"])
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static likeComment(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let commentId = req.params.commentId || "";
            let likeModel = FeedCommentLikeModel.fromRequest(req);

            likeModel.commentId = commentId;
            likeModel.userId = session.userId;

            if (FeedHandler.checkCommentLikeConstraintField(likeModel) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (likeModel.type) {
                case FEED_TYPE.CHATTER_BOX:
                case FEED_TYPE.FIND_A_BUDDY:
                case FEED_TYPE.SPONSOR_ADS:
                case FEED_TYPE.GARAGE_SALE:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.FEED_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return FeedService.likeComment(likeModel)
                .then(() => {
                    res.status(HttpStatus.OK);
                    if (likeModel.isLike) {
                        res.json(StateModel.likeSuccessful());
                    } else {
                        res.json(StateModel.unLikeSuccessful());
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * delete feeds
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let feedId = req.params.id || "";

            return FeedService.removeById(feedId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintField(data: FeedModel): boolean {
        let result = true;

        if (data.condoId === "" || data.type === "") {
            result = false;
        }

        if (data.type === FEED_TYPE.FIND_A_BUDDY) {
            if (data.content === "") {
                result = false;
            }
        }

        if (data.title === "" && data.content === "") {
            return false;
        }

        return result;
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkLikeConstraintField(data: FeedLikeModel): boolean {
        let result = true;

        if (data.type === "") {
            result = false;
        }

        return result;
    }

    /**
     * Suppend Garage Sale
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static suspend(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let feed = FeedModel.fromSuspendRequest(req);
            feed.id = req.params.id || "";

            return FeedService.update(feed)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }


    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkCommentConstraintField(data: FeedCommentModel): boolean {
        let result = true;

        if (data.type === "" || data.content === "") {
            result = false;
        }

        return result;
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkCommentLikeConstraintField(data: FeedCommentLikeModel): boolean {
        let result = true;

        if (data.type === "") {
            result = false;
        }

        return result;
    }

    /**
     * Delete comment
     * @param req
     * @param res
     * @param next
     */
    public static deleteComment(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let roleId = session.roleId;
        let userId = roleId === ROLE.CONDO_MANAGER ? null : session.userId;
        let commentId: string = req.params.commentId || "";

        return FeedService.validateComment(commentId, userId)
        .then(comment => {
            return FeedService.deleteComment(comment);
        })
        .then(() => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * Delete comment
     * @param req
     * @param res
     * @param next
     */
    public static updateComment(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let roleId = session.roleId;
        let userId = roleId === ROLE.CONDO_MANAGER ? null : session.userId;
        let commentId = req.params.commentId || "";
        let comment = FeedCommentModel.fromRequest(req);
        comment.id = commentId;

        return FeedService.validateComment(commentId, userId)
        .then(() => {
            return FeedService.updateComment(comment);
        })
        .then(() => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(commentId));
        })
        .catch(err => {
            next(err);
        });
    }

}

export default FeedHandler;
