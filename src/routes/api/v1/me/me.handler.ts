/**
 * Created by davidho on 1/19/17.
 */


import {ErrorCode, HttpStatus} from "../../../../libs";
import {ExceptionModel, SessionModel, StateModel, BaseModel} from "../../../../models";
import * as express from "express";
import * as Promise from "bluebird";
import {PROPERTIES, JWT_WEB_TOKEN, ROLE, MESSAGE_INFO} from "../../../../libs/constants";
import {UserService, DeviceService, SessionService, UserSettingService} from "../../../../interactors/index";
import {Utils} from "../../../../libs/utils";
import {UserModel, UserSettingModel, DeviceModel} from "../../../../models";

export class MeHandler {

    /**
     * profiles
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static profile(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            return UserService.detailById(session.userId, ["role", "condo", "unit.floor.block"], ["password", "isDeleted"])
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

    public static updateProfile(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let user = UserModel.fromRequest(req);
            user.id = session.userId;
            if (session.roleId !== ROLE.SYSTEM_ADMIN) {
                user.email = undefined;
                // Prevent change user password, if you wan to change, use changePassword() instead
                user.password = undefined;
                user.phoneNumber = undefined;
            }

            return UserService.updateMyProfile(user)
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

    public static changePassword(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let oldPassword = req.body.oldPassword || null;
            let newPassword = req.body.newPassword || null;
            let isEncrypted = BaseModel.getBoolean(req.body.isEncrypted, false);

            let userInfo: UserModel;
            let decryptOldPassword = oldPassword;
            let decryptNewPassword = newPassword;

            if (oldPassword == null || newPassword == null) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (!Utils.validatePassword(newPassword)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_PASSWORD.CODE,
                    ErrorCode.RESOURCE.INVALID_PASSWORD.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            let deviceModel = DeviceModel.fromRequest(req.headers, session.userId);
            return Promise.resolve()
                .then(() => {
                    if (isEncrypted) {
                        return Utils.decryptStringWithRsaPrivateKey(oldPassword);
                    }
                    return oldPassword;
                })
                .then(password => {
                    decryptOldPassword = password;
                    if (isEncrypted) {
                        return Utils.decryptStringWithRsaPrivateKey(newPassword);
                    }
                    return newPassword;
                })
                .then(password => {
                    decryptNewPassword = password;
                    return UserService.changePassword(session.userId, decryptOldPassword, decryptNewPassword, ["role"], ["password"]);
                })
                .then(obj => {
                    userInfo = obj;
                    if (deviceModel.deviceId != null && deviceModel.registrarId != null) {
                        return DeviceService.create(deviceModel);
                    } else {
                        return deviceModel;
                    }
                })
                .then(() => {
                    return SessionService.create(userInfo.id, userInfo.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, deviceModel.deviceId, session.platform, ["hash"]);
                })
                .then(session => {
                    UserModel.filter(userInfo, ["password"]);
                    session.user = userInfo;
                    res.status(HttpStatus.OK);
                    res.json(session);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static cancelUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let userId = session.userId;
            let unitId = req.body.unitId || null;

            if (session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT && session.roleId !== ROLE.USER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            return UserService.cancelUnit(userId, unitId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.stateSuccessful(null, MESSAGE_INFO.MI_CANCEL_UNIT_SUCCESSFUL));

                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.stateSuccessful(null, MESSAGE_INFO.MI_CANCEL_UNIT_UN_SUCCESSFUL));
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
     * list card by user, return cardmodel[]
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listCard(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;

        return UserService.listCard(userId, null)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * get card default by user, return card model
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static getCardDefault(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;

        return UserService.listCard(userId, true) // get card default by user
            .then((object) => {
                res.status(HttpStatus.OK);
                if (!object) {
                    return res.json({});
                }
                return res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * update card default
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static setCardDefault(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let token = req.body.token || "";

        if (token === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UserService.setCardDefault(userId, token) // get card default by user
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * get card default by user, return card model
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteCreditCard(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let token = req.body.token || "";

        if (token === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UserService.deleteCreditCard(userId, token) // get card default by user
            .then((object) => {
                if (object === true) {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful());
                }
            })
            .catch(err => {
                next(err);
            });
    }


    public static createCard(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let cardNonce = req.body.cardNonce || null;
        let isDefault = req.body.isDefault || null;

        return UserService.createCard(userId, cardNonce, isDefault)
            .then(cardModel => {
                res.status(HttpStatus.OK);
                res.json(cardModel);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */

    public static getSetting(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();

            return UserSettingService.findByUserId(session.userId)
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
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static updateSetting(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let obj = UserSettingModel.fromRequest(req);
            obj.userId = session.userId;

            return UserSettingService.createOrUpdate(obj)
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

}

export default MeHandler;

