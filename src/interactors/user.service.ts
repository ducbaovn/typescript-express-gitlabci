import {BaseService} from "./base.service";
import * as Promise from "bluebird";
import {Utils} from "../libs/utils";
import * as Schema from "../data/sql/schema";
import {
    CollectionWrap,
    CondoModel,
    CondoSecurityModel,
    DeviceModel,
    ExceptionModel,
    SessionModel,
    UserManagerModel,
    UserModel,
    UserSettingModel,
    UserUnitModel
} from "../models";
import {
    CondoRepository,
    CondoSecurityRepository,
    DeviceRepository,
    RoleRepository,
    SessionRepository,
    UnitRepository,
    UserManagerRepository,
    UserRepository,
    UserSettingRepository,
    UserUnitRepository
} from "../data";
import {
    DeviceService,
    PaymentGatewayManager,
    PaymentSourceService,
    PinService,
    SessionService,
    UserManagerService,
    UserUnitService
} from "./index";
import {ErrorCode, FirebaseAdmin, HttpStatus, Jwt, Logger, Mailer} from "../libs";
import {
    DELETE_STATUS,
    ENABLE_STATUS,
    FIREBASE_ONLINE_STATUS,
    JWT_WEB_TOKEN,
    PASSWORD_LENGTH,
    PROPERTIES,
    ROLE,
    STATUS_REQUEST_USER,
    STATUS_USER
} from "../libs/constants";
import * as firebase from "firebase-admin";

/**
 * Created by kiettv on 1/3/17.
 */
export class UserService extends BaseService<UserModel, typeof UserRepository> {

    constructor() {
        super(UserRepository);
    }

    /**
     * MOBILE verify phone and email
     * @param email
     * @param area
     * @param phoneNumber
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public verifyEmail(email: string): Promise<UserModel> {
        return Promise.resolve()
            .then(() => {
                return UserRepository.findByEmail(email);
            })
            .then(user => {
                if (user !== null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.EMAIL_IS_USED.CODE,
                        ErrorCode.RESOURCE.EMAIL_IS_USED.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
            });
    }

    /**
     * MOBILE verify pin and register
     * @param pin
     * @param user
     * @param deviceModel
     * @param filters
     * @returns {Bluebird<U>}
     */
    public verifyPinAndRegister(pin: string, user: UserModel, deviceModel: DeviceModel, platform: string, filters = []): Promise<SessionModel> {
        let sessionInfo: SessionModel;
        return Promise.resolve()
            .then(() => {
                return PinService.verify(user.phoneNumber, pin);
            })
            .then(pinInfo => {
                return this.verifyEmail(user.email);
            })
            .then(pinInfo => {
                user.roleId = ROLE.USER;
                user.isEnable = ENABLE_STATUS.YES;
                user.password = Utils.hashPassword(user.password);
                user.userStatus = STATUS_USER.NEED_CONDO;

                return this.create(user, ["role"], ["password", "isEnable", "isDeleted"]);
            })
            .tap((userInfo) => {
                if (FirebaseAdmin.getInstance() != null) {
                    Promise.resolve(FirebaseAdmin.getInstance()
                        .auth()
                        .createUser({
                            uid: userInfo.id,
                            email: userInfo.email,
                            emailVerified: true,
                            displayName: `${userInfo.firstName} ${userInfo.lastName}`,
                            disabled: false,
                        }))
                        .then(() => {
                            return FirebaseAdmin.getInstance()
                                .database()
                                .ref("/users")
                                .child(userInfo.id)
                                .set({
                                    avatar: userInfo.avatarUrl != null ? userInfo.avatarUrl : "",
                                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                                    email: userInfo.email,
                                    firstName: userInfo.firstName,
                                    id: userInfo.id,
                                    lastName: userInfo.lastName,
                                    online: FIREBASE_ONLINE_STATUS.ONLINE,
                                    phoneNumber: userInfo.phoneNumber,
                                    unitNumber: "",
                                    isReceivePushChat: UserSettingModel.defaultSetting().isReceiverPushChat,
                                    updatedDate: firebase.database.ServerValue.TIMESTAMP
                                })
                                .catch(err => Logger.error(err.message, err));
                        })
                        .then(() => {
                            if (deviceModel.userAgent === PROPERTIES.MOBILE_USER_AGENT && deviceModel.deviceId != null && deviceModel.deviceId !== "") {
                                return FirebaseAdmin.getInstance()
                                    .database()
                                    .ref("/devices")
                                    .child(userInfo.id)
                                    .update({
                                        [`${deviceModel.deviceId}`]: deviceModel.registrarId,
                                    })
                                    .catch(err => Logger.error(err.message, err));
                            }
                        })
                        .catch(err => Logger.error(err.message, err));
                }
            })
            .then(userInfo => {
                if (userInfo) {
                    user = userInfo;
                    deviceModel.userId = userInfo.id;
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
                session.user = user;
                sessionInfo = session;
                let setting = UserSettingModel.defaultSetting();
                setting.userId = user.id;
                return UserSettingRepository.insert(setting); // create user setting
            })
            .then(() => {
                // send email welcome to condo
                Mailer.sendWelcomeToCondo(sessionInfo.user);
                return sessionInfo;
            });
    }

    /**
     * Search User
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {any}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UserModel>> {
        return UserRepository.search(searchParams, offset, limit, related, filters);
    }

    /**
     * verifyLoginPrudential
     * @param email
     * @param password
     * @param filters
     * @returns {Bluebird<U>}
     */
    public verifyLoginPrudential(email: string, password: string, filters = []): Promise<UserModel> {
        return UserRepository.findByEmail(email, ["role", "unit.floor.block", "condo", "condoManager"], filters)
            .then(object => {
                if (object == null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.CODE,
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                let isCorrect = Utils.compareHash(password, object.password);
                if (isCorrect) {
                    return object;
                }
                return Promise.reject(new ExceptionModel(
                    ErrorCode.AUTHENTICATION.WRONG_USER_NAME_OR_PASSWORD.CODE,
                    ErrorCode.AUTHENTICATION.WRONG_USER_NAME_OR_PASSWORD.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            });
    }

    /**
     * create User
     * @param user
     * @param related
     * @param filters
     * @returns {any}
     */
    public create(user: UserModel, related = [], filters = []): Promise<UserModel> {
        if (user != null) {
            return UserRepository.findByEmail(user.email)
                .then(object => {
                    if (object != null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.EMAIL_IS_USED.CODE,
                            ErrorCode.RESOURCE.EMAIL_IS_USED.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return UserRepository.insert(user);
                })
                .then((object) => {
                    return UserRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    /**
     * create User (owner, tennant) in CM
     * @param user
     * @param related
     * @param filters
     * @returns {any}
     */
    public createNewUser(user: UserModel, userUnit: UserUnitModel, related = [], filters = []): Promise<UserModel> {
        let condoModel = new CondoModel();
        let unitNumber: string;
        return CondoRepository.findOne(userUnit.condoId, ["paymentGatewayAccount"])
            .then(condo => {
                if (condo === null || condo.isDeleted === true || condo.isEnable === false) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                condoModel = condo;
                return UnitRepository.findOne(userUnit.unitId);
            })
            .then((unit) => {
                unitNumber = unit.unitNumber;
                if (unit === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.UNIT_INVALID.CODE,
                        ErrorCode.RESOURCE.UNIT_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                return RoleRepository.findOne(userUnit.roleId);
            })
            .then((role) => {
                if (role === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.ROLE_INVALID.CODE,
                        ErrorCode.RESOURCE.ROLE_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                user.roleId = userUnit.roleId;
                user.isEnable = ENABLE_STATUS.YES;

                let password = `${Utils.randomPassword(PASSWORD_LENGTH)}`;
                user.password = Utils.hashPassword(password);

                user.userStatus = STATUS_USER.APPROVE;

                Mailer.sendNewPassword(user, password);

                return this.create(user, ["role"], ["password", "isEnable", "isDeleted"]);
            })
            .then(object => {
                user = object;
                userUnit.userId = user.id;
                userUnit.status = STATUS_REQUEST_USER.APPROVE;
                if (userUnit.isMaster) {
                    return UserUnitService.archiveOldMasterAndDependent(userUnit.unitId, userUnit.roleId)
                        .then(object => {
                            return userUnit;
                        });
                }
                return UserUnitService.checkRole(userUnit.unitId, userUnit.roleId)
                    .then(result => {
                        userUnit.isResident = result.isResident;
                        userUnit.tenancyExpiry = result.tenancyExpiry;
                        return userUnit;
                    });
            })
            .then(object => {
                return UserUnitRepository.insert(userUnit);
            })
            .then(userUnitDto => {
                return UserUnitService.updateResident(userUnitDto.id, userUnit.isResident);
            })
            .then(result => {
                user.unitNumber = unitNumber;
                return PaymentSourceService.findOrCreate(user, condoModel)
                    .catch(err => Logger.error("Create payment for user failed"));
            })
            .then(paymentSource => {
                let setting = UserSettingModel.defaultSetting();

                setting.userId = user.id;

                return UserSettingRepository.insert(setting); // create user setting
            })
            .then(() => {
                return user;
            })
            .tap((userInfo) => {
                if (FirebaseAdmin.getInstance() != null) {
                    FirebaseAdmin.getInstance()
                        .auth()
                        .createUser({
                            uid: userInfo.id,
                            email: userInfo.email,
                            emailVerified: true,
                            displayName: `${userInfo.firstName} ${userInfo.lastName}`,
                            disabled: false,
                        })
                        .then(() => {
                            return FirebaseAdmin.getInstance()
                                .database()
                                .ref("/users")
                                .child(userInfo.id)
                                .set({
                                    avatar: userInfo.avatarUrl != null ? userInfo.avatarUrl : "",
                                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                                    email: userInfo.email,
                                    firstName: userInfo.firstName,
                                    id: userInfo.id,
                                    lastName: userInfo.lastName,
                                    online: false,
                                    isReceivePushChat: UserSettingModel.defaultSetting().isReceiverPushChat,
                                    phoneNumber: userInfo.phoneNumber != null ? userInfo.phoneNumber : "",
                                    unitNumber: userInfo.unit != null && userInfo.unit.unitNumber != null ? userInfo.unit.unitNumber : "",
                                    updatedDate: firebase.database.ServerValue.TIMESTAMP
                                });
                        })
                        .catch(err => Logger.error(err.message, err));
                }
            })
            .catch(err => {
                if (user.id != null) {
                    UserRepository.forceDelete(user.id);
                }
                throw err;
            });
    }


    /**
     * [PORTAL][SYSADMIN] Create Only UserManager And CondoSecurity
     * @param user
     * @param related
     * @param filters
     * @returns {any}
     */
    public adminCreate(user: UserModel): Promise<any> {
        let userModel;
        return Promise.resolve()
            .then(() => {
                if (user.roleId === ROLE.CONDO_MANAGER) {
                    // return UserManagerService.verifyCondoOfCondoManager(user);
                    return true;
                } else if (user.roleId === ROLE.CONDO_SECURITY) {
                    return true;
                } else {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
            })
            .then(() => {
                return UserRepository.findByEmail(user.email);
            })
            .then(object => {
                if (object != null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.EMAIL_IS_USED.CODE,
                        ErrorCode.RESOURCE.EMAIL_IS_USED.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                user.password = Utils.hashPassword(user.password);
                return UserRepository.insert(user);
            })
            .tap((userDto) => {
                userModel = userDto;
                if (user.roleId === ROLE.CONDO_MANAGER) {
                    let userCondo = new UserManagerModel();
                    userCondo.condoId = user.condoId;
                    userCondo.userId = userDto.id;
                    return UserManagerRepository.insert(userCondo);
                }
                if (user.roleId === ROLE.CONDO_SECURITY) {
                    let condoSecurity = new CondoSecurityModel();
                    condoSecurity.condoId = user.condoId;
                    condoSecurity.userId = userDto.id;
                    return CondoSecurityRepository.insert(condoSecurity);
                }
            })
            .tap(() => {
                let setting = UserSettingModel.defaultSetting();
                setting.userId = userModel.id;
                return UserSettingRepository.insert(setting); // create user setting
            });
    };


    /**
     * get user profile by id
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public detailById(id: string, related = [], filters = []): Promise<UserModel> {
        return UserRepository.findOne(id, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                return object;
            });
    }

    /**
     * remove user, update is_deleted = true, delete logic
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        return UserUnitRepository.updateWithUserId(id)
            .then(() => {
                return UserRepository.deleteLogic(id);
            })
            .then(object => {

                // Clear session;
                SessionRepository.deleteByQuery(q => {
                    q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, object.id);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
                // Clear device;
                DeviceRepository.deleteByQuery(q => {
                    q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, object.id);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });

                return object != null;


            });
    }

    /**
     * admin update: full update
     * @param user
     * @param related(optional)
     * @param filters(optional)
     * @returns {any}
     */
    public adminUpdate(user: UserModel): Promise<any> {
        return UserRepository.findOne(user.id, ["condoManager", "condoSecurity"])
            .then(object => {
                if (!object || object.isDeleted || !object.isEnable) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                if (user.password) {
                    if (!Utils.validatePassword(user.password)) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.USER_INVALID.CODE,
                            ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    user.password = Utils.hashPassword(user.password);
                }
                if (user.emailContact && !Utils.validateEmail(user.emailContact)) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                        ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                if (user.email && user.email !== object.email) {
                    if (!Utils.validateEmail(user.email)) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                            ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    return UserRepository.findByEmail(user.email)
                        .then(obj => {
                            if (obj) {
                                return Promise.reject(new ExceptionModel(
                                    ErrorCode.RESOURCE.EMAIL_IS_USED.CODE,
                                    ErrorCode.RESOURCE.EMAIL_IS_USED.MESSAGE,
                                    false,
                                    HttpStatus.BAD_REQUEST,
                                ));
                            }
                            return Promise.resolve(object);
                        });
                } else {
                    return Promise.resolve(object);
                }
            })
            .then((object) => {
                if (user.condoId) {
                    if (object.roleId === ROLE.CONDO_MANAGER && user.condoId !== object.condoManager.id) {
                        let data = {};
                        data[Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID] = user.condoId;
                        return UserManagerRepository.updateByQuery(q => {
                            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.ID, user.managerId);
                            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
                        }, data);
                    }
                    if (object.roleId === ROLE.CONDO_SECURITY && user.condoId !== object.condo.id) {
                        let condoSecurity = new CondoSecurityModel();
                        condoSecurity.id = user.securityId;
                        condoSecurity.condoId = user.condoId;
                        condoSecurity.userId = user.id;
                        return CondoSecurityRepository.update(condoSecurity);
                    }
                }
            })
            .then((object) => {
                return UserRepository.update(user);
            })
            .then(userDto => {
                return UserRepository.findOne(user.id);
            })
            .tap((userInfo) => {
                if (FirebaseAdmin.getInstance() != null) {
                    FirebaseAdmin.getInstance()
                        .database()
                        .ref("/users")
                        .child(userInfo.id)
                        .update({
                            avatar: userInfo.avatarUrl != null ? userInfo.avatarUrl : "",
                            createdDate: firebase.database.ServerValue.TIMESTAMP,
                            email: userInfo.email,
                            firstName: userInfo.firstName,
                            id: userInfo.id,
                            lastName: userInfo.lastName,
                            online: false,
                            phoneNumber: userInfo.phoneNumber != null ? userInfo.phoneNumber : "",
                            unitNumber: userInfo.unit != null && userInfo.unit.unitNumber != null ? userInfo.unit.unitNumber : "",
                            updatedDate: firebase.database.ServerValue.TIMESTAMP
                        })
                        .catch(err => Logger.error(err.message, err));
                }
            });


    }


    /**
     * Update My Profile
     * @param user
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public updateMyProfile(user: UserModel, related = [], filters = []): Promise<UserModel> {
        return UserRepository.update(user)
            .then((object) => {
                return UserRepository.findOne(object.id, related, filters);
            })
            .tap((userInfo) => {
                if (FirebaseAdmin.getInstance() != null) {
                    FirebaseAdmin.getInstance()
                        .database()
                        .ref("/users")
                        .child(userInfo.id)
                        .update({
                            avatar: userInfo.avatarUrl != null ? userInfo.avatarUrl : "",
                            createdDate: firebase.database.ServerValue.TIMESTAMP,
                            email: userInfo.email,
                            firstName: userInfo.firstName,
                            id: userInfo.id,
                            lastName: userInfo.lastName,
                            online: false,
                            phoneNumber: userInfo.phoneNumber != null ? userInfo.phoneNumber : "",
                            unitNumber: userInfo.unit != null && userInfo.unit.unitNumber != null ? userInfo.unit.unitNumber : "",
                            updatedDate: firebase.database.ServerValue.TIMESTAMP
                        })
                        .catch(err => Logger.error(err.message, err));
                }
            });
    }

    /**
     * forgotPassword
     * @param email
     * @param url
     * @returns {Bluebird<boolean>}
     */
    public forgotPassword(email: string, url: string): Promise<boolean> {
        return Promise.resolve()
            .then(() => {
                return UserRepository.findByEmail(email);
            })
            .then((object) => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_EMAIL.CODE,
                        ErrorCode.RESOURCE.INVALID_EMAIL.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                let token = Jwt.encode({userId: object.id}, JWT_WEB_TOKEN.RESET_PASSWORD_TIME_EXPIRED, Jwt.DEFAULT_CLIENT);

                let link = `${url}${token}`;
                // send mail reset password
                Mailer.sendResetPassword(object, link);
                return true;
            });

    }

    /**
     * set password when reset password
     * @param userId
     * @param newPassword
     * @param related
     * @param filters
     */
    public setPassword(userId: string, newPassword: string, related = [], filters = []): Promise<UserModel> {
        let user: UserModel;
        return UserRepository.findOne(userId)
            .then(result => {
                user = result;
                if (user === null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                user.password = Utils.hashPassword(newPassword);
                return UserRepository.update(user);
            })
            .then(userDto => {
                // Clear session;
                SessionRepository.deleteByQuery(q => {
                    q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
                // Clear device;
                DeviceRepository.deleteByQuery(q => {
                    q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
                return user;
            });
    }

    /**
     * change password
     * @param userId
     * @param oldPassword
     * @param newPassword
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public changePassword(userId: string, oldPassword: string, newPassword: string, related = [], filters = []) {
        return UserRepository.findOne(userId)
            .then(user => {
                if (user === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                } else {
                    if (Utils.compareHash(oldPassword, user.password) === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.AUTHENTICATION.WRONG_PASSWORD.CODE,
                            ErrorCode.AUTHENTICATION.WRONG_PASSWORD.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    } else if (Utils.compareHash(oldPassword, Utils.hashPassword(newPassword)) === true) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.PASSWORD_USE_BEFORE.CODE,
                            ErrorCode.RESOURCE.PASSWORD_USE_BEFORE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    } else {
                        user.password = Utils.hashPassword(newPassword);
                        return UserRepository.update(user);
                    }
                }
            })
            .then(user => {
                // Clear session;
                SessionRepository.deleteByQuery(q => {
                    q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });

                // Clear device;
                DeviceRepository.deleteByQuery(q => {
                    q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
                return user;
            })
            .then(object => {
                return UserRepository.findOne(userId, ["role", "unit", "condo"], ["password", "isEnable", "isDeleted"]);
            });
    }

    /**
     * cancel unit: use for user in mobile
     * @param userUnitId
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public cancelUnit(userId: string, unitId: string, related = [], filters = []): Promise<boolean> {
        return UserRepository.findOne(userId)
            .then(user => {
                if (user === null && user.isDeleted === true) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                user.userStatus = STATUS_USER.NEED_CONDO;
                return UserRepository.update(user);
            })
            .then(object => {
                if (object === null) {
                    return null;
                }
                return UserUnitRepository.updateWithUserId(userId, unitId);
            })
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }


    /**
     * createPaymentMethod
     * @param user
     * @param related
     * @param filters
     * @returns {any}
     */
    public createCard(userId: string, nonceFromTheClient: string, isDefault: boolean): Promise<any> {
        let userInfo: UserModel;
        let condo: CondoModel;
        return UserRepository.findOne(userId, ["unit", "condo.paymentGatewayAccount"])
            .then(object => {
                if (object === null || object.isEnable === ENABLE_STATUS.NO || object.isDeleted === DELETE_STATUS.YES) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                userInfo = object;
                condo = object.condo;
                if (!condo || !condo.id) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                if (!condo.payByCash) {
                    return PaymentSourceService.findOrCreate(userInfo, condo);
                }
                return null;
            })
            .then(paymentSource => {
                if (!paymentSource || !paymentSource.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.CREATE_CARD_FOR_PAY_BY_CASH.CODE,
                        ErrorCode.PAYMENT.CREATE_CARD_FOR_PAY_BY_CASH.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                userInfo.customerId = paymentSource.customerId;
                return PaymentGatewayManager.createCard(userInfo, nonceFromTheClient, isDefault);
            });

    }

    public listCard(userId: string, isDefault: boolean): Promise<any> {
        let userInfo: UserModel;
        let condo: CondoModel;
        return UserRepository.findOne(userId, ["unit", "condo.paymentGatewayAccount"])
            .then(object => {
                if (object === null || object.isEnable === ENABLE_STATUS.NO || object.isDeleted === DELETE_STATUS.YES) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                userInfo = object;
                condo = object.condo;
                if (!condo.payByCash) {
                    return PaymentSourceService.findOrCreate(userInfo, condo);
                }
                return null;
            })
            .then(paymentSource => {
                if (!paymentSource || !paymentSource.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.CODE,
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return PaymentGatewayManager.listCard(paymentSource.customerId, condo.id, isDefault);
            });
    }

    public setCardDefault(userId: string, token: string): Promise<any> {
        let condo: CondoModel;
        return UserRepository.findOne(userId, ["unit", "condo.paymentGatewayAccount"])
            .then(object => {
                if (object === null || object.isEnable === ENABLE_STATUS.NO || object.isDeleted === DELETE_STATUS.YES) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                condo = object.condo;
                if (!condo.payByCash) {
                    return PaymentSourceService.findOrCreate(object, condo);
                }
                return null;
            })
            .then(paymentSource => {
                if (!paymentSource || !paymentSource.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.CODE,
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return PaymentGatewayManager.setCardDefault(condo.id, token, paymentSource.customerId);
            });
    }

    public deleteCreditCard(userId: string, token: string): Promise<any> {
        let condo: CondoModel;
        return UserRepository.findOne(userId, ["unit", "condo.paymentGatewayAccount"])
            .then(object => {
                if (object === null || object.isEnable === ENABLE_STATUS.NO || object.isDeleted === DELETE_STATUS.YES) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                condo = object.condo;
                if (!condo.payByCash) {
                    return PaymentSourceService.findOrCreate(object, condo);
                }
                return null;
            })
            .then(paymentSource => {
                if (!paymentSource || !paymentSource.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.CODE,
                        ErrorCode.PAYMENT.LIST_CARD_FOR_PAY_BY_CASH.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return PaymentGatewayManager.deleteCard(condo.id, token, paymentSource.customerId);
            });
    }

    public countUser(condoId: string, roleId = ROLE.OWNER): Promise<number> {
        return UserRepository.countByQuery(q => {
            q.innerJoin(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`);
            q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
            q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
            q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID}`, roleId);
            q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_USER.APPROVE);
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
        });
    }

    public reportUser(condoId: string): Promise<any> {
        let reportRoles = [ROLE.OWNER, ROLE.TENANT];
        return Promise.mapSeries(reportRoles, roleId => {
            return this.countUser(condoId, roleId);
        })
            .then(result => {
                let report = [];
                reportRoles.forEach((role, index) => {
                    report.push({
                        key: role,
                        value: result[index]
                    });
                });
                return report;
            });
    }
}

export default UserService;
