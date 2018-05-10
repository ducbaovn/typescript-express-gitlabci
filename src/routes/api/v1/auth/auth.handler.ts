/**
 * Created by davidho on 1/5/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import * as uuid from "uuid";
import { DeviceModel, ExceptionModel, SessionModel, UserModel, PinInfoModel, BaseModel } from "../../../../models";
import { ErrorCode, HttpStatus, Logger, FirebaseAdmin, Utils } from "../../../../libs";
import { PROPERTIES, JWT_WEB_TOKEN, ROLE, PIN_CONFIG, HEADERS, PLATFORM } from "../../../../libs/constants";
import { UserService, DeviceService, SessionService, PinService, SmsService } from "../../../../interactors";
import Redis from "../../../../data/redis/redis";

export class AuthHandler {

    public static firebaseLogin(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let session: SessionModel = res.locals.session || SessionModel.empty();
            SessionService.createFirebaseToken(session.userId)
                .then((token) => {
                    res.status(HttpStatus.OK);
                    res.json({
                        token: token,
                    });
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public static login(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            AuthHandler.loginByEmail(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Admin Login (verify username, password and send pin)
     * @param req
     * @param res
     * @param next
     */
    public static adminLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        let email = req.body.email || "";
        let password = req.body.password || "";
        let sessionInfo: SessionModel;
        let deviceModel: DeviceModel;
        let adminToken: string;
        let platform = req.headers[HEADERS.DEVICE_OS];

        if (AuthHandler.checkConstraintField(req.body) === false) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        return UserService.verifyLoginPrudential(email, password, ["isEnable", "isDeleted"])
        .then(user => {
            let pinInfo = new PinInfoModel();
            let pinExpiryTime = user.roleId === ROLE.CONDO_MANAGER ? PIN_CONFIG.CM_EXPIRY_TIME : PIN_CONFIG.EXPIRY_TIME;
            return PinService.generate(user.phoneNumber, pinExpiryTime)
            .then(result => {
                pinInfo = result;
                if (process.env.NODE_ENV !== "development") {
                    return SmsService.sendPin("+65", user.phoneNumber, pinInfo.pin);
                }
            })
            .then(result => {
                adminToken = uuid.v4();
                return Redis.getClient().setAsync(Redis.getAdminTokenKey(adminToken), user.id, "EX", PIN_CONFIG.EXPIRY_TIME);
            })
            .then(result => {
                sessionInfo = new SessionModel();
                sessionInfo.user = user;
                sessionInfo.adminToken = adminToken;
                return sessionInfo.toResponse();
            });
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(result);
        })
        .catch(err => {
            return next(err);
        });
    }

    /**
     * verify pin and login admin
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static verifyPinAndLogin(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let pin = req.body.pin || "";
        let adminToken = req.body.adminToken || "";
        let userInfo: UserModel;
        let deviceModel: DeviceModel;
        let sessionInfo: SessionModel;
        let platform = req.headers[HEADERS.DEVICE_OS];

        return Redis.getClient().getAsync(Redis.getAdminTokenKey(adminToken))
        .then(userId => {
            if (!userId) {
                throw new ExceptionModel(
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN.CODE,
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED
                );
            }
            return UserService.findOne(userId, ["role", "condoManager", "condoSecurity"]);
        })
        .then(user => {
            userInfo = user;
            if (!user.phoneNumber || !pin) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                );
            }
            return PinService.verify(user.phoneNumber, pin);
        })
        .then(pinInfo => {
            deviceModel = DeviceModel.fromRequest(req.headers, userInfo.id);
            if (deviceModel.userAgent === PROPERTIES.MOBILE_USER_AGENT) {
                return DeviceService.create(deviceModel);
            } else {
                return deviceModel;
            }
        })
        .then(object => {
            deviceModel = object;
            return SessionService.create(userInfo.id, userInfo.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, object.deviceId, platform, ["hash"]);
        })
        .then(session => {
            UserModel.filter(userInfo, ["password"]);
            session.user = userInfo;
            sessionInfo = session;
            return SessionService.createFirebaseToken(userInfo.id, userInfo, deviceModel)
                .catch(err => Logger.error(err.message, err));
        })
        .then(token => {
            sessionInfo.firebaseToken = token;
            res.status(HttpStatus.OK);
            res.json(sessionInfo.toResponse());
        })
        .catch(err => {
            return next(err);
        });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    private static loginByEmail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let platform = req.headers[HEADERS.DEVICE_OS];
        let email = req.body.email || "";
        let password = req.body.password || "";
        let isEncrypted = BaseModel.getBoolean(req.body.isEncrypted, false);

        let roleId: string;
        let userInfo: UserModel;
        let sessionInfo: SessionModel;

        if (AuthHandler.checkConstraintField(req.body) === false) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        let deviceModel: DeviceModel;

        if (isEncrypted) {
            return Utils.decryptStringWithRsaPrivateKey(password)
            .then(decryptPassword => UserService.verifyLoginPrudential(email, decryptPassword, ["isEnable", "isDeleted"]))
            .tap(user => SessionService.deleteSessionByUserIdPlatform(user.id, platform))
            .tap(user => DeviceService.deleteByUserId(user.id))
            .then(object => {
                userInfo = object;
                roleId = object.roleId;

                if (roleId === ROLE.USER || roleId === ROLE.OWNER || roleId === ROLE.TENANT ) {
                    deviceModel = DeviceModel.fromRequest(req.headers, object.id);
                    if (deviceModel.userAgent === PROPERTIES.MOBILE_USER_AGENT) {
                        return DeviceService.create(deviceModel);
                    } else {
                        return deviceModel;
                    }
                }
                next(new ExceptionModel(
                    ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.CODE,
                    ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED
                ));
            })
            .then(object => {
                deviceModel = object;
                return SessionService.create(userInfo.id, userInfo.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, object.deviceId, platform, ["hash"]);
            })

            .then(session => {
                UserModel.filter(userInfo, ["password"]);
                session.user = userInfo;
                sessionInfo = session;
                return SessionService.createFirebaseToken(userInfo.id, userInfo, deviceModel)
                    .catch(err => Logger.error(err.message, err));
            })
            .then(token => {
                sessionInfo.firebaseToken = token;

                res.status(HttpStatus.OK);
                res.json(sessionInfo.toResponse());
            })
            .catch(err => {
                next(err);
            });
        } else {
            return UserService.verifyLoginPrudential(email, password, ["isEnable", "isDeleted"])
            .tap(user => SessionService.deleteSessionByUserIdPlatform(user.id, platform))
            .tap(user => DeviceService.deleteByUserId(user.id))
            .then(object => {
                userInfo = object;
                roleId = object.roleId;

                if (roleId === ROLE.USER || roleId === ROLE.OWNER || roleId === ROLE.TENANT ) {
                    deviceModel = DeviceModel.fromRequest(req.headers, object.id);
                    if (deviceModel.userAgent === PROPERTIES.MOBILE_USER_AGENT) {
                        return DeviceService.create(deviceModel);
                    } else {
                        return deviceModel;
                    }
                }
                next(new ExceptionModel(
                    ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.CODE,
                    ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED
                ));
            })
            .then(object => {
                deviceModel = object;
                return SessionService.create(userInfo.id, userInfo.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, object.deviceId, platform, ["hash"]);
            })
            .then(session => {
                UserModel.filter(userInfo, ["password"]);
                session.user = userInfo;
                sessionInfo = session;
                return SessionService.createFirebaseToken(userInfo.id, userInfo, deviceModel)
                    .catch(err => Logger.error(err.message, err));
            })
            .then(token => {
                sessionInfo.firebaseToken = token;

                res.status(HttpStatus.OK);
                res.json(sessionInfo.toResponse());
            })
            .catch(err => {
                next(err);
            });
        }
    }

    /**
     *
     * @param data
     * @param loginType
     * @returns {boolean}
     */
    private static checkConstraintField(data: any) {
        let result = true;
        if (data.email === "" || data.password === "") {
            result = false;
        }

        return result;
    }
}

export default AuthHandler;

