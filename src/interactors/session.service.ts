import { AUTH_CODE } from "./../middlewares/authentication";
import {SessionRepository, UserRepository, UserSettingRepository} from "../data";
import * as Schema from "../data/sql/schema";
import {ErrorCode, FirebaseAdmin, HttpStatus, Jwt, Logger} from "../libs";
import {BearerObject} from "../libs/jwt";
import {ExceptionModel, SessionModel, UserModel, DeviceModel, UserSettingModel} from "../models";
import {BaseService} from "./base.service";
import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import * as UUID from "uuid";
import * as firebase from "firebase-admin";
import { HEADERS, PLATFORM } from "../libs/constants";
/**
 * Created by davidho on 1/9/17.
 */
export class SessionService extends BaseService<SessionModel, typeof SessionRepository> {
    constructor() {
        super(SessionRepository);
    }


    public createFirebaseToken(userId: string, user?: UserModel, device?: DeviceModel): Promise<string> {
        if (userId == null) {
            return Promise.resolve(null);
        }

        let sdk = FirebaseAdmin.getInstance();
        if (sdk == null) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.OPEATION.FIREBASE_DISABLE.CODE,
                ErrorCode.OPEATION.FIREBASE_DISABLE.MESSAGE,
                false,
                HttpStatus.INTERNAL_SERVER_ERROR,
            ));
        }

        return Promise.resolve()
            .then(() => {
                if (user == null) {
                    return UserRepository.findOne(userId);
                }
                return user;
            })
            .tap((userModel) => {
                sdk.auth().getUser(userId)
                    .catch(err => Logger.warn("Account does not exist on Firebase, create one"))
                    .then((firebaseUser) => {
                        if (firebaseUser == null) {
                            return sdk.auth().createUser({
                                uid: userId,
                                email: userModel.email,
                                emailVerified: true,
                                displayName: `${userModel.firstName} ${userModel.lastName}`,
                                disabled: false,
                            });
                        }
                    })
                    .catch(err => {
                        Logger.error(err.message, err);
                        return null;
                    });
            })
            .tap((userInfo) => {
                UserSettingRepository.findByUserId(userInfo.id)
                    .then((settings) => {
                        let isReceivePushChat: boolean = UserSettingModel.defaultSetting().isReceiverPushChat;

                        if (settings != null) {
                            isReceivePushChat = settings.isReceiverPushChat;
                        }

                        Promise.resolve(sdk.database()
                            .ref("/users")
                            .child(userInfo.id)
                            .update({
                                avatar: userInfo.avatarUrl != null ? userInfo.avatarUrl : "",
                                email: userInfo.email,
                                firstName: userInfo.firstName,
                                id: userInfo.id,
                                lastName: userInfo.lastName,
                                phoneNumber: userInfo.phoneNumber != null ? userInfo.phoneNumber : "",
                                unitNumber: userInfo.unit != null && userInfo.unit.unitNumber != null ? userInfo.unit.unitNumber : "",
                                isReceivePushChat: isReceivePushChat,
                                updatedDate: firebase.database.ServerValue.TIMESTAMP
                            }))
                            .then(() => {
                                if (device != null && device.registrarId != null) {
                                    return sdk.database()
                                        .ref("/devices")
                                        .child(userInfo.id)
                                        .update({
                                            [`${device.deviceId}`]: device.registrarId,
                                        })
                                        .catch(err => Logger.error(err.message, err));
                                }
                            })
                            .catch(err => Logger.error(err.message, err));
                    })
                    .catch(err => Logger.error(err.message, err));
            })
            .then((firebaseUser) => {
                return sdk.auth().createCustomToken(userId);
            });
    }

    public create(userId: string, roleId: string, expire: number, deviceId: string, platform: string, filters = []): Promise<SessionModel> {
        if (userId == null || expire === 0 || deviceId == null) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let current = Date.now();
        let session = new SessionModel();
        session.userId = userId;
        session.roleId = roleId;
        session.hash = UUID.v4();
        session.platform = platform;
        session.expire = momentTz.tz(new Date(current + expire), "UTC");
        session.token = Jwt.encode(session, expire, deviceId);
        return SessionRepository.insert(session)
            .then((object) => {
                return SessionRepository.findOne(object.id, null, filters);
            });
    }

    public deleteSessionByUserId(userId: string, hash?: string, ignoreHashes?: string[]): Promise<any> {
        if (userId != null) {
            return SessionRepository.deleteByQuery(q => {
                q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                if (hash != null) {
                    q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH, hash);
                }
                if (ignoreHashes != null && ignoreHashes.length > 0) {
                    q.whereNotIn(Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH, ignoreHashes);
                }
            });
        }
        return Promise.resolve(null);
    }

    public deleteSessionByUserIdPlatform(userId: string, platform: string, hash?: string, ignoreHashes?: string[]): Promise<any> {
        if (userId != null && platform != null && platform.length > 0 && (platform === PLATFORM.IOS || platform === PLATFORM.ANDROID)) {
            return SessionRepository.deleteByQuery(q => {
                q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                if (hash != null) {
                    q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH, hash);
                }
                if (ignoreHashes != null && ignoreHashes.length > 0) {
                    q.whereNotIn(Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH, ignoreHashes);
                }
                q.andWhere(q1 => {
                    q1.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM, PLATFORM.IOS);
                    q1.orWhere(Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM, PLATFORM.ANDROID);
                });
            });
        }
        return Promise.resolve(null);
    }

    public verifyToken(jwtObject: BearerObject, token: string): Promise<any> {
        let exception;
        if (token == null || token === "") {
            exception = new ExceptionModel(ErrorCode.RESOURCE.INVALID_PARAMETER.CODE, ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE, false);
            exception.httpStatus = HttpStatus.BAD_REQUEST;
            return Promise.reject(exception);
        }

        let session;
        return SessionRepository.findOneByQuery(q => {
            q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.TOKEN, token);
            q.andWhere(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, jwtObject.payload.userId);
        })
            .then(object => { // fix with reddit
                if (object != null) {
                    session = object;
                    return UserRepository.findOne(object.userId, ["userUnit", "condo", "condoManager", "condoSecurity"]);
                }
                throw AUTH_CODE.SINGLE_LOGGED_IN;
            })
            .then(object => {
                session.user = object;
                session.roleId = object.roleId;
                return session;
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }
}

export default SessionService;
