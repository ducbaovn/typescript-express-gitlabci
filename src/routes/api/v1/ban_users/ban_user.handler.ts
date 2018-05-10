/**
 * Created by davidho on 4/13/17.
 */

import * as express from "express";
import {BaseHandler} from "../base.handler";
import {BAN_USER_TYPE, PROPERTIES, ROLE} from "../../../../libs/constants";
import {HttpStatus, ErrorCode} from "../../../../libs/index";
import {BanUserService} from "../../../../interactors";
import {SessionModel} from "../../../../models/session.model";
import {BanUserModel, ExceptionModel, StateModel} from "../../../../models";

export class BanUserHandler extends BaseHandler {
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

            return BanUserService.search(queryParams, offset, limit, ["user", "user.unit", "condo"], ["isDeleted"])
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
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static view(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let banUserId = req.params.id || null;

            return BanUserService.findBanUserById(banUserId, ["user", "user.unit", "condo"], ["isDeleted"])
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
     * create(submit) banUsers
     * @param req
     * @param res
     * @param next
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let banUser = BanUserModel.fromRequest(req);

            if (BanUserHandler.checkConstraintField(banUser) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (banUser.type) {
                case BAN_USER_TYPE.CHATTERBOX:
                case BAN_USER_TYPE.FIND_A_BUDDY:
                case BAN_USER_TYPE.GARAGE_SALE:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.BAN_USER_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.BAN_USER_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return BanUserService.create(banUser)
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
     * update banUsers
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {

            let banUser = BanUserModel.fromRequest(req);
            banUser.id = req.params.id || "";

            if (BanUserHandler.checkConstraintField(banUser) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            switch (banUser.type) {
                case BAN_USER_TYPE.CHATTERBOX:
                case BAN_USER_TYPE.FIND_A_BUDDY:
                case BAN_USER_TYPE.GARAGE_SALE:
                    break;

                default:
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.BAN_USER_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.BAN_USER_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
            }

            return BanUserService.update(banUser)
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
     * delete banUsers
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let banUserId = req.params.id || "";

            return BanUserService.removeById(banUserId)
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
    public static checkConstraintField(data: BanUserModel): boolean {
        let result = true;

        if (data.type === "" || data.userId === "" || data.condoId === "") {
            result = false;
        }

        return result;
    }

}

export default BanUserHandler;
