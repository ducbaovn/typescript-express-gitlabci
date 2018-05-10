/**
 * Created by davidho on 3/3/17.
 */


import * as Promise from "bluebird";
import * as express from "express";
import { ErrorCode, HttpStatus, Utils, Logger, SMS } from "../../../../libs";
import { ExceptionModel, StateModel } from "../../../../models";
import {PROPERTIES, ROLE} from "../../../../libs/constants";
import { UserService, UserManagerService } from "../../../../interactors/index";
import { UserModel } from "../../../../models/user.model";

export class UserManagerHandler {
    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || {};

        return UserManagerService.search(queryParams, offset, limit, ["user.condoManager"], ["isDeleted", "password"])
        .then(userManagers => {
            res.header(PROPERTIES.HEADER_TOTAL, userManagers.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }
            res.status(HttpStatus.OK);
            res.json(userManagers.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static detail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return UserManagerService.findOne(req.params.id, ["user.condoManager"], ["isDeleted", "password"])
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(object);
        })
        .catch(err => {
            if (!(err instanceof ExceptionModel)) {
                err = new ExceptionModel(
                    ErrorCode.RESOURCE.GENERIC.CODE,
                    err.message,
                    false,
                    HttpStatus.BAD_GATEWAY
                );
            }
            next(err);
        });
    }

    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let user = UserModel.fromRequestUserManager(req);
        user.roleId = undefined;
        user.managerId = req.params.id;

        if (!user.managerId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UserManagerService.findOne(user.managerId)
        .then(userManager => {
            if (!userManager) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED,
                ));
            }
            user.id = userManager.userId;
            return UserService.adminUpdate(user);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userManagerId = req.params.id;
        let userId: string;

        return UserManagerService.findOne(userManagerId)
            .then(manager => {
                if (!manager) {
                    next(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    userId = manager.userId;
                    return UserManagerService.delete(userManagerId);
                }
            })
            .then(id => {
                return UserService.delete(userId);
            })
            .then((success) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful(userManagerId));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * create
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userManager = UserModel.fromRequestUserManager(req);

        if (UserManagerHandler.checkConstraintField(userManager) === false) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        if (!Utils.validatePassword(userManager.password)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PASSWORD.CODE,
                ErrorCode.RESOURCE.INVALID_PASSWORD.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        if (!Utils.validateEmail(userManager.emailContact)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        userManager.roleId = ROLE.CONDO_MANAGER;

        return UserService.adminCreate(userManager)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintField(data: UserModel): boolean {
        let result = true;
        if (!data.firstName || !data.lastName || !data.email || !data.password || !data.phoneNumber || !data.condoId || !data.agent ) {
            result = false;
        }
        return result;
    }
}

export default UserManagerHandler;

