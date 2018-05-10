/**
 * Created by davidho on 1/9/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import * as firebase from "firebase-admin";
import {BaseHandler} from "../base.handler";
import {
    CustomerPaymentModel,
    DeviceModel,
    ExceptionModel,
    PinInfoModel,
    SessionModel,
    StateModel,
    UserModel,
    UserUnitModel,
    BaseModel
} from "../../../../models";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Utils} from "../../../../libs";
import {DeviceService, PinService, RoleService, SessionService, SmsService, UserService} from "../../../../interactors";
import {ENABLE_STATUS, FIREBASE_ONLINE_STATUS, JWT_WEB_TOKEN, PROPERTIES, ROLE, HEADERS, PLATFORM} from "../../../../libs/constants";
import { CondoSecurityRepository } from "../../../../data";

export class UserHandler extends BaseHandler {

    public static ping(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return Promise.resolve()
                .then(() => {
                    let customer = new CustomerPaymentModel();
                    // customer.firstName = "truc";
                    // customer.lastName = "ho";
                    // return BrainTree.createCustomer(customer);
                    // return BrainTree.createCreditCard();
                    // return BrainTree.generateClientToken();
                    // return BrainTree.findCustomer("14155072");

                    // return BrainTree.createTransaction(10, "");
                })
                .then((object) => {
                    if (object) {
                        res.status(HttpStatus.OK);
                        return res.json(object);
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
     * verify email and send OTP
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static verifyEmail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let area = req.body.area;
        let phoneNumber = req.body.phoneNumber;
        let email = req.body.email;
        let pinInfo: PinInfoModel;
        if (!phoneNumber || !email) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        return Promise.resolve()
            .then(() => {
                return UserService.verifyEmail(email);
            })
            .then(() => {
                return PinService.generate(phoneNumber);
            })
            .then(result => {
                pinInfo = result;
                if (process.env.NODE_ENV !== "development") {
                    return SmsService.sendPin(area, phoneNumber, pinInfo.pin);
                }
            })
            .then(result => {
                pinInfo.pin = undefined;
                res.status(HttpStatus.OK);
                return res.json(pinInfo);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * send pin
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static sendPin(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let area = req.body.area;
        let phoneNumber = req.body.phoneNumber;
        let pinInfo: PinInfoModel;
        return PinService.generate(phoneNumber)
            .then(result => {
                pinInfo = result;
                if (process.env.NODE_ENV !== "development") {
                    return SmsService.sendPin(area, phoneNumber, pinInfo.pin);
                }
            })
            .then(result => {
                pinInfo.pin = undefined;
                res.status(HttpStatus.OK);
                return res.json(pinInfo);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * verify pin of user and register user
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static verifyPinAndRegister(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let pin = req.body.pin || "";
            let isEncrypted = BaseModel.getBoolean(req.body.isEncrypted, false);
            let user = UserModel.fromRequest(req);
            let deviceModel: DeviceModel = DeviceModel.fromRequest(req.headers, user.id);
            let platform = req.headers[HEADERS.DEVICE_OS];
            if (user.phoneNumber === "" || pin === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (UserHandler.checkConstraintField(user) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (!Utils.validateEmail(user.email)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return Promise.resolve()
                .then(() => {
                    if (isEncrypted) {
                        return Utils.decryptStringWithRsaPrivateKey(user.password);
                    }
                    return user.password;
                })
                .then(password => {
                    user.password = password;
                    return UserService.verifyPinAndRegister(pin, user, deviceModel, platform);
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
        } catch (err) {
            next(err);
        }
    }

    /**
     * forgot password
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static forgotPassword(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let email = req.body.email || "";
            if (email === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.EMPTY_EMAIL.CODE,
                    ErrorCode.RESOURCE.EMPTY_EMAIL.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            if (!Utils.validateEmail(email)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            let link = `${req.protocol}://${req.get("host")}/api/v1/tokens/`;
            return UserService.forgotPassword(email, link)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.resetPasswordSuccessful());
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
     * logout
     * @param req
     * @param res
     * @param next
     */
    public static logout(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let session = res.locals.session || SessionModel.empty();
            let deviceModel = DeviceModel.fromRequest(req.headers, session.userId);

            SessionService.deleteSessionByUserId(session.userId, session.hash)
                .then(() => {
                    let sdk = FirebaseAdmin.getInstance();

                    if (sdk != null) {
                        // Remove the device token into firebase.
                        if (deviceModel != null && deviceModel.deviceId != null && deviceModel.registrarId != null) {
                            sdk.database()
                                .ref("/devices")
                                .child(session.userId)
                                .child(`${deviceModel.deviceId}`)
                                .remove()
                                .catch(err => Logger.error(err.message, err));
                        }

                        // Update online status for user after logout on firebase.
                        sdk.database()
                            .ref("/users")
                            .child(session.userId)
                            .update({
                                online: FIREBASE_ONLINE_STATUS.OFFLINE,
                                updatedDate: firebase.database.ServerValue.TIMESTAMP
                            })
                            .catch(err => Logger.error(err.message, err));
                    }

                    return DeviceService.deleteByUserId(session.userId, deviceModel.deviceId);
                })
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful());
                })
                .catch(error => {
                    next(error);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * register user - user for OWNER and TENANT
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static register(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let platform = req.headers[HEADERS.DEVICE_OS];
            let user = UserModel.fromRequest(req);

            if (user.roleId !== ROLE.OWNER && user.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (UserHandler.checkConstraintField(user) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (!Utils.validateEmail(user.email)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            user.isEnable = ENABLE_STATUS.YES;
            let deviceModel: DeviceModel;
            return Promise.resolve()
                .then(() => {
                    return RoleService.findById(user.roleId);
                })
                .then((object) => {
                    if (object) {
                        user.roleId = object.id;
                    } else {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.ROLE_INVALID.CODE,
                            ErrorCode.RESOURCE.ROLE_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    return UserService.create(user, ["role", "condo"], ["password", "isEnable", "isDeleted"]);
                })
                .then((userInfo) => {
                    if (userInfo) {
                        user = userInfo;
                        deviceModel = DeviceModel.fromRequest(req.headers, userInfo.id);
                        if (deviceModel.userAgent === PROPERTIES.MOBILE_USER_AGENT) {
                            return DeviceService.create(deviceModel);
                        } else {
                            return deviceModel;
                        }
                    }
                })
                .then(object => {
                    return SessionService.create(user.id, user.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, object.deviceId, platform, ["hash"]);
                })
                .then(session => {
                    UserModel.filter(user, ["password", "isDeleted"]);
                    session.user = user;
                    res.status(HttpStatus.OK);
                    res.json(session.toResponse());
                    return session;
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    /**
     * Edit user: use for super admin and condo manage
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let user = UserModel.fromRequest(req);
        user.id = req.params.id;

        return Promise.resolve(true)
            .then(() => {
                if (user.password) { // if admin change password user, user have to re-login
                    return SessionService.deleteSessionByUserId(user.id);
                }
            })
            .then(() => {
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

    /**
     * remove user, delete
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let userId = req.params.id || "";

            if (session.roleId !== ROLE.SYSTEM_ADMIN) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            return UserService.removeById(userId)
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

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            if (session.roleId !== ROLE.SYSTEM_ADMIN) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;


            return UserService.search(queryParams, offset, limit, [], ["password"])
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
     * checkConstraintField
     * @param data
     * @param isUpdated
     * @returns {boolean}
     */
    public static checkConstraintField(data: UserModel, isUpdated: boolean = false): boolean {
        let result = true;

        if (data.email === "" || data.firstName === "" || data.lastName === "" || data.phoneNumber === "" || data.avatarUrl === "") {
            result = false;
        }

        if (!isUpdated) {
            if (data.password === "") {
                result = false;
            }
        }

        return result;
    }

    /**
     * Create user in portal
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let user = UserModel.fromRequest(req);
            let userUnit = UserUnitModel.fromRequest(req);

            if (UserHandler.checkConstraintField(user) === false || !userUnit.condoId || !userUnit.unitId || !userUnit.roleId) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (!Utils.validateEmail(user.email)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                    ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return UserService.createNewUser(user, userUnit)
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

//
//  CONDO SECURITY
//

    public static listSecurity(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || {};

        return CondoSecurityRepository.search(queryParams, offset, limit, ["user", "condo"], ["isDeleted", "password"])
        .then(list => {
            res.header(PROPERTIES.HEADER_TOTAL, list.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }
            res.status(HttpStatus.OK);
            res.json(list.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static detailSecurity(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let id = req.params.id;

        return CondoSecurityRepository.findOne(id, ["user", "condo"], ["isDeleted", "password"])
        .then(condoSecurity => {
            res.status(HttpStatus.OK);
            res.json(condoSecurity);
        })
        .catch(err => {
            next(err);
        });
    }

    public static createSecurity(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let condoSecurity = UserModel.fromRequestCondoSecurity(req);

        if (!condoSecurity.condoId || !condoSecurity.email || !condoSecurity.phoneNumber) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        if (!Utils.validatePassword(condoSecurity.password)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PASSWORD.CODE,
                ErrorCode.RESOURCE.INVALID_PASSWORD.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        if (!Utils.validateEmail(condoSecurity.emailContact) || !Utils.validateEmail(condoSecurity.email)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UserService.adminCreate(condoSecurity)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static updateSecurity(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let userSecurity = UserModel.fromRequestCondoSecurity(req);
        userSecurity.securityId = req.params.id;

        return UserService.adminUpdate(userSecurity)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteSecurity(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let securityId = req.params.id;
        let userId: string;

        return CondoSecurityRepository.findOne(securityId)
            .then(security => {
                if (!security) {
                    next(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    userId = security.userId;
                    return CondoSecurityRepository.deleteLogic(securityId);
                }
            })
            .then(id => {
                return UserService.delete(userId);
            })
            .then((success) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful(securityId));
            })
            .catch(err => {
                next(err);
            });
    }
}

export default UserHandler;
