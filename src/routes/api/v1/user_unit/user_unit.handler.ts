/**
 * Created by baond on 26/04/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {DeviceModel, ExceptionModel, SessionModel, StateModel, UserModel, UserUnitModel} from "../../../../models";
import {ErrorCode, HttpStatus, Scheduler} from "../../../../libs";
import {SessionService, SmsService, UserManagerService, UserUnitService} from "../../../../interactors";
import {
    JWT_WEB_TOKEN, MESSAGE_INFO, NOTIFY_TENANT_EXPIRE, PROPERTIES, ROLE, SCHEDULER_SCRIPT,
    SMS_TYPE
} from "../../../../libs/constants";

export class UserUnitHandler extends BaseHandler {
    /**
     * list request
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        return UserUnitService.searchUserUnit(queryParams, offset, limit, ["user", "unit.floor.block"], ["isDeleted", "role", "password"])
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
    }

    /**
     * get user unit detail
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static view(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let id = req.params.id;

        return UserUnitService.findOne(id, ["user", "unit.floor.block"], ["isDeleted", "role", "password"])
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * update user unit (update proofUrls, isResident)
     * @param req
     * @param res
     * @param next
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userunit = UserUnitModel.fromRequest(req);
        userunit.id = req.params.id;
        return UserUnitService.update(userunit)
            .then(userUnitDto => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(userUnitDto.id));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * create request for unit, update new user role (owner or tenant)
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static createRequest(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let deviceModel: DeviceModel = DeviceModel.fromRequest(req.headers, session.userId);

        let condoId = req.body.condoId || "";
        let unitId = req.body.unitId || "";
        let roleId = req.body.roleId || "";
        let proofUrl = req.body.proofUrls || [];

        if (condoId === "" || unitId === "" || roleId === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return Promise.resolve()
            .then(() => {
                return UserUnitService.createRequest(condoId, unitId, roleId, session.userId, proofUrl, deviceModel, session.platform);
            })
            .then((object) => {
                if (object) {
                    res.status(HttpStatus.OK);
                    res.json(object.toResponse());
                }
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * approve user, check valid unit
     * important: update success, pls update userStatus to "APPROVE" in table user
     * @param req
     * @param res
     * @param next
     */
    public static approve(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userUnitId = req.params.id || "";
        let tenancyExpiry = req.body.tenancyExpiry || null;
        let isMaster = req.body.isMaster || false;
        let isResident = req.body.isResident || false;

        return UserUnitService.approve(userUnitId, isMaster, isResident, tenancyExpiry)
            .then(model => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(model.id));

                // if (model.tenancyExpiry != null) {
                //     let job = Scheduler.createUniqueJob(SCHEDULER_SCRIPT.TRIGGER_NAME, {
                //         url: `${req.protocol}://${req.get("host")}`,
                //         path: NOTIFY_TENANT_EXPIRE.TENANT_EXPIRE_PATH,
                //         payload: {id: model.id},
                //     }, model.id);

                //     Scheduler.scheduleOneShot(job, model.tenancyExpiry.toDate());
                // }
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Reject User
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static reject(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userUnitId = req.params.id || "";
        return UserUnitService.reject(userUnitId)
            .then((id) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.stateSuccessful(id, MESSAGE_INFO.MI_REJECT_SUCCESSFUL));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * archive user unit request
     * important: update success, pls update userStatus to "NEED CONDO" in table user
     * @param req
     * @param res
     * @param next
     */
    public static archive(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userUnitId = req.params.id || "";
        let tenancyExpiry = req.body.tenancyExpiry || null;

        return UserUnitService.archive(userUnitId)
            .then(id => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(id));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * archive user unit by client
     * important: update success, pls update userStatus to "NEED CONDO" in table user
     * @param req
     * @param res
     * @param next
     */
    public static archiveByClient(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let roleId = session.roleId;
        let user: UserModel;
        let deviceModel: DeviceModel = DeviceModel.fromRequest(req.headers, userId);

        if (!userId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UserUnitService.findByUserId(userId)
            .then(userUnit => {
                if (!userUnit) {
                    next(new ExceptionModel(
                        ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.CODE,
                        ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    user = userUnit.user;
                    return UserUnitService.archive(userUnit.id);
                }
            })
            .then(object => {
                return SessionService.create(userId, ROLE.USER, JWT_WEB_TOKEN.DEFAULT_EXPIRE, deviceModel.deviceId, session.platform, ["hash"]);
            })
            .then(session => {
                session.user = user;
                res.status(HttpStatus.OK);
                res.json(session);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * check role of unit
     * @param req
     * @param res
     * @param next
     */
    public static checkRole(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let unitId = req.query.unitId;
        let roleId = req.query.roleId;

        return UserUnitService.checkRole(unitId, roleId)
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(result);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * @param   req
     * @param   res
     * @param   next
     * @returns {boolean}
     */
    public static sendSMS(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let phoneNumbers: string[] = req.body.phoneNumbers || [];
        let message = req.body.message || null;
        return UserManagerService.findByUserId(userId)
            .then(userManager => {
                if (!userManager) {
                    next(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    Promise.each(phoneNumbers, (phoneNumber => {
                        return SmsService.send(null, phoneNumber, message, SMS_TYPE.UNIT_LOG, userManager.id);
                    }));
                }
            })
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
}

export default UserUnitHandler;
