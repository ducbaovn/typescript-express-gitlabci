import {BaseService} from "./base.service";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {USER_UNIT_TABLE_SCHEMA} from "../data/sql/schema";
import {
    BaseModel,
    CollectionWrap,
    CondoModel,
    DeviceModel,
    ExceptionModel,
    SessionModel,
    UserModel,
    UserUnitModel
} from "../models";
import {CondoRepository, RoleRepository, UnitRepository, UserRepository, UserUnitRepository} from "../data";
import {UserUnitDto} from "../data/sql/models";
import {PaymentSourceService, PushNotificationService, SessionService, UserManagerService} from "./index";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Mailer} from "../libs";
import {
    DELETE_STATUS,
    ENABLE_STATUS,
    JWT_WEB_TOKEN,
    MESSAGE_INFO,
    ROLE,
    STATUS_REQUEST_USER,
    STATUS_USER
} from "../libs/constants";

/**
 * Created by baond on 26/04/17.
 */
export class UserUnitService extends BaseService<UserUnitModel, typeof UserUnitRepository> {
    constructor() {
        super(UserUnitRepository);
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
    public searchUserUnit(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UserUnitModel>> {
        return UserUnitRepository.search(searchParams, offset, limit, related, filters);
    }

    /**
     * MOBILE request condo and unit
     * @param condoId
     * @param unitId
     * @param roleId
     * @param userId
     * @param proofUrls
     * @returns {Bluebird<SessionModel>}
     */
    public createRequest(condoId: string, unitId: string, roleId: string, userId: string, proofUrls: string[], deviceModel: DeviceModel, platform: string): Promise<SessionModel> {
        let userInfo: UserModel;
        let userUnitInfo: UserUnitModel;
        let userUnitModel = new UserUnitModel();
        let validatePromise: any[] = [
            CondoRepository.findOne(condoId),
            UnitRepository.findOne(unitId),
            RoleRepository.findOne(roleId),
            UserRepository.findOne(userId)
        ];

        return Promise.all(validatePromise)
            .then(result => {
                if (result[0] === null || result[0].isDeleted === true || result[0].isEnable === false) {
                    throw (new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                ;
                if (result[1] === null || result[1].isDeleted === true || result[1].isEnable === false) {
                    throw (new ExceptionModel(
                        ErrorCode.RESOURCE.UNIT_INVALID.CODE,
                        ErrorCode.RESOURCE.UNIT_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                ;
                if (result[2] === null || result[2].isDeleted === true || result[2].isEnable === false) {
                    throw (new ExceptionModel(
                        ErrorCode.RESOURCE.ROLE_INVALID.CODE,
                        ErrorCode.RESOURCE.ROLE_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                ;
                if (result[3] === null || result[3].isDeleted === true || result[3].isEnable === false || result[3].roleId !== ROLE.USER || result[3].userStatus !== STATUS_USER.NEED_CONDO) {
                    throw (new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                ;
                userInfo = result[3];
                userUnitModel.userId = result[3].id;
                userUnitModel.condoId = condoId;
                userUnitModel.unitId = unitId;
                userUnitModel.roleId = roleId;
                userUnitModel.proofUrls = proofUrls;
                userUnitModel.isMaster = false;
                userUnitModel.isResident = false;
                userUnitModel.status = STATUS_REQUEST_USER.NEW;

                return UserUnitRepository.countUnitInUse(unitId, roleId);
            })
            .then((object) => {
                let remarks: string = "";
                if (object > 0) {
                    remarks += MESSAGE_INFO.MI_REMARK_HAS_MASTER(roleId);
                }
                if (remarks !== "") {
                    remarks += ",";
                }
                if (userUnitModel.proofUrls.length < 2 && roleId === ROLE.TENANT) {
                    remarks += `${ErrorCode.RESOURCE.PROOF_OF_RESIDENCE_NOT_FOUND.MESSAGE}`;
                }
                userUnitModel.remarks = remarks;
                return UserUnitRepository.insertGet(userUnitModel, ["user", "condo", "unit.floor.block"], ["password", "isEnable", "isDeleted"]);
            })
            .then((object) => {
                userUnitInfo = object;
                userUnitInfo.user.roleId = roleId; // update role to tenant, current role is user
                userInfo.roleId = roleId;
                userInfo.userStatus = STATUS_USER.WAITING_APPROVE;
                return UserRepository.update(userInfo);
            })
            .then(() => {
                return UserRepository.findOne(userId, ["role"], ["password", "isEnable", "isDeleted"]);
            })
            .then(object => {
                userInfo = object;
                return SessionService.create(object.id, object.roleId, JWT_WEB_TOKEN.DEFAULT_EXPIRE, deviceModel.deviceId, platform, ["hash"]);
            })
            .then(session => {
                session.user = userInfo;
                if (roleId === ROLE.OWNER) {
                    // send email to owner application submit
                    Mailer.sendOwnerApplicationSubmit(userUnitInfo);
                    // send email to condo manager
                    Mailer.sendNewUserApplicationReceivedOwner(userUnitInfo);
                } else if (roleId === ROLE.TENANT) {
                    // send email to tenant application submit
                    Mailer.sendTenantApplicationSubmit(userUnitInfo);
                    // send email to condo manager
                    Mailer.sendNewUserApplicationReceivedTenant(userUnitInfo);
                }

                return session;
            })
            .tap(() => {
                // Update the number of new users are waiting approve.
                this.updateCounterUser(condoId)
                    .catch(err => Logger.error(err.message, err));
            });
    }

    public approve(userUnitId: string, isMaster: boolean, isResident: boolean, tenancyExpiry?: string, related = [], filters = []): Promise<UserUnitModel> {
        let userUnit: UserUnitModel;
        let user: UserModel;
        let condo: CondoModel;

        return UserUnitRepository.findOneByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID, userUnitId);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.NEW);
        }, ["user", "condo.manager", "unit.floor.block.condo.paymentGatewayAccount"])
            .then(object => {
                if (object === null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                userUnit = object;
                userUnit.tenancyExpiry = BaseModel.getDate(tenancyExpiry);
                userUnit.isMaster = isMaster;
                userUnit.isResident = isResident;
                userUnit.status = STATUS_REQUEST_USER.APPROVE;
                user = object.user;
                condo = object.unit.floor.block.condo;

                if (isMaster) {
                    return this.archiveOldMasterAndDependent(object.unitId, object.roleId)
                        .then(userUnits => {
                            return userUnit;
                        });
                }
                return this.checkRole(userUnit.unitId, userUnit.roleId)
                    .then(result => {
                        userUnit.isResident = result.isResident;
                        userUnit.tenancyExpiry = result.tenancyExpiry;
                        return userUnit;
                    });
            })
            .then(object => {
                return this.update(userUnit);
            })
            .then(object => {
                if (!condo.payByCash) {
                    user.unitNumber = userUnit.unit.unitNumber;
                    // TODO: Incorrect result when create stripe failed, this should not affect approved flow
                    return PaymentSourceService.findOrCreate(user, condo)
                        .catch(err => Logger.error(err.message, err));
                }
            })
            .then(object => {
                user.userStatus = STATUS_USER.APPROVE;
                return UserRepository.update(user);

            })
            .then(() => {
                // send mail welcome
                Mailer.sendCondoManagerApproved(userUnit);
                // push welcome message
                PushNotificationService.sendWelcomeCondo(user.id);
                return userUnit;
            })
            .tap(() => {
                // Decrease counter user after CM approved.
                this.updateCounterUser(condo.id, false)
                    .catch(err => Logger.error(err.message, err));
            });
    }

    public buildUserUnitModelByRule(userUnit: UserUnitModel): Promise<UserUnitModel> {
        return Promise.resolve()
            .then(() => {
                return UserUnitRepository.countUnitOfUser(userUnit.userId); // 1 user only live in 1 unit
            })
            .then(count => {
                if (count > 0) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_HAS_UNIT.CODE,
                        ErrorCode.RESOURCE.USER_HAS_UNIT.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                // select all user in unit
                return UserUnitRepository.listAllUserByUnit(userUnit.unitId);
            })
            .then(userUnitArray => {
                if (userUnitArray.length === 0) { // if user is the first in unit, auto set master and resident
                    userUnit.isMaster = true;
                    userUnit.isResident = true;
                } else {
                    let userMasters = userUnitArray.filter(function (x) {
                        return x.isMaster === true;
                    });

                    if (userMasters.length === 2) { // unit has 2 master, automatic set isMaster == false (dependent) and set resident follow user master
                        for (let i = 0; i < userMasters.length; i++) {
                            let userMaster = userMasters[i];
                            if (userUnit.roleId === userMaster.roleId) {
                                userUnit.isMaster = false;
                                userUnit.isResident = userMaster.isResident;
                            }
                        }
                    } else if (userMasters.length === 1) { // unit has 1 master
                        let userMaster = userMasters[0];
                        if (userUnit.roleId === userMaster.roleId) { // if the same role, automatic set isMaster == false (dependent) and set resident follow user master
                            userUnit.isMaster = false;
                            userUnit.isResident = userMaster.isResident;
                        } else {
                            userUnit.isMaster = true;
                            userUnit.isResident = true;

                            let roleMaster = "";
                            if (userUnit.roleId === ROLE.OWNER) {
                                roleMaster = ROLE.TENANT;
                            } else {
                                roleMaster = ROLE.OWNER;
                            }

                            let ids: string[] = [];
                            for (let i = 0; i < userUnitArray.length; i++) {
                                let userMaster = userUnitArray[i];

                                if (userMaster.roleId === roleMaster) {
                                    userMaster.isResident = false;

                                    UserUnitRepository.update(userMaster)
                                        .catch(error => {
                                            Logger.error(error);
                                        });
                                    ids.push(userMaster.userId);
                                }
                            }
                            // UserUnitRepository.updateResidentWithIds(ids, false) // comment because method error, no work
                            //     .catch(error => {
                            //         Logger.error(error);
                            //     });

                        }
                    }
                }
                userUnit.isEnable = true;
                userUnit.status = STATUS_REQUEST_USER.APPROVE;
                return userUnit;
            });
    }

    /**
     * [PORTAL]: Reject user request
     * @param userUnitId
     * @param related
     * @param filters
     * @returns {Bluebird<string>}
     */
    public reject(userUnitId: string, related = [], filters = []): Promise<string> {
        let userInfo: UserModel;
        let userUnitInfo: UserUnitModel;
        return UserUnitRepository.findOneByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID, userUnitId);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.NEW);
        }, ["user", "condo"])
            .then(userUnit => {
                if (userUnit === null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                userUnitInfo = userUnit;
                userInfo = userUnit.user;
                // Change status unit is Reject
                userUnit.status = STATUS_REQUEST_USER.REJECT;
                return UserUnitRepository.update(userUnit);
            })
            .then(userUnitDto => {
                let userModel: UserModel = new UserModel();
                userModel.id = userUnitDto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID);
                userModel.roleId = ROLE.USER;
                userModel.userStatus = STATUS_USER.NEED_CONDO;
                return UserRepository.update(userModel);
            })
            .then(userDto => {
                // send mail to user that condo manage has been rejected
                Mailer.sendCondoManagerRejected(userUnitInfo);
                return userUnitId;
            })
            .tap(() => {
                // Decrease counter user after CM approved.
                this.updateCounterUser(userUnitInfo.condoId, false)
                    .catch(err => Logger.error(err.message, err));
            });
    }

    /**
     * [PORTAL]: Archive user request
     * @param userUnitId
     * @param related
     * @param filters
     * @returns {Bluebird<string>}
     */
    public archive(userUnitId: string, related = [], filters = []): Promise<string> {
        return UserUnitRepository.findOneByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID, userUnitId);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
        })
            .then(userUnit => {
                if (userUnit === null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    );
                }
                userUnit.status = STATUS_REQUEST_USER.ARCHIVED;
                if (userUnit.isMaster) {
                    return this.archiveOldMasterAndDependent(userUnit.unitId, userUnit.roleId)
                        .then(result => {
                            return userUnitId;
                        });
                }
                return UserUnitRepository.update(userUnit)
                    .then(userUnitDto => {
                        let user: UserModel = new UserModel();
                        user.id = userUnitDto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID);
                        user.userStatus = STATUS_USER.NEED_CONDO;
                        user.roleId = ROLE.USER;
                        return UserRepository.update(user);
                    })
                    .then(userDto => {
                        return SessionService.deleteSessionByUserId(userUnit.userId);
                    })
                    .then(sessionDto => {
                        return userUnitId;
                    });
            });
    }

    /**
     * [PORTAL]: update user unit (proofUrls, isResident)
     * @param userUnit
     * @returns {Bluebird<UserUnitDto>}
     */
    public update(userUnit: UserUnitModel): Promise<UserUnitDto> {
        return Promise.resolve()
            .then(() => {
                if (userUnit.isResident != null) {
                    return this.updateResident(userUnit.id, userUnit.isResident);
                }
                return Promise.resolve(null);
            })
            .then(() => {
                return UserUnitRepository.update(userUnit);
            })
            .then((object) => {
                if (userUnit.roleId === ROLE.TENANT) {
                    let userUnitStatus = {};
                    userUnitStatus[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.HAD_EXPIRED_REMINDER] = false;
                    return UserUnitRepository.updateByQuery(q => {
                        q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID, userUnit.id);
                    }, userUnitStatus);
                } else {
                    return object;
                }
            });
    }

    /**
     * [PORTAL]: update isResident
     * @param userUnitId
     * @param isResident
     * @returns {Bluebird<boolean>}
     */
    public updateResident(userUnitId: string, isResident: boolean): Promise<any[]> {
        return UserUnitRepository.findOne(userUnitId)
            .then(userUnit => {
                let roleResident = {};
                roleResident[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT] = isResident;
                let updateRoleResident = UserUnitRepository.updateByQuery(q => {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, userUnit.unitId);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, userUnit.roleId);
                }, roleResident);

                let otherRoleResident = {};
                otherRoleResident[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT] = !isResident;
                let otherRole = userUnit.roleId === ROLE.OWNER ? ROLE.TENANT : ROLE.OWNER;
                let updateOtherRoleResident = UserUnitRepository.updateByQuery(q => {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, userUnit.unitId);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, otherRole);
                }, otherRoleResident);
                return Promise.all([updateRoleResident, updateOtherRoleResident]);
            });
    }

    /**
     * [PORTAL]: archive old master and dependent
     * @param userUnitId
     * @param isResident
     * @returns {Bluebird<boolean>}
     */
    public archiveOldMasterAndDependent(unitId: string, roleId: string): Promise<UserUnitModel[]> {
        return UserUnitRepository.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, unitId);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, roleId);
        })
            .then(userUnits => {
                return Promise.each(userUnits, (userUnit => {
                    userUnit.status = STATUS_REQUEST_USER.ARCHIVED;
                    let updateUserUnit = this.update(userUnit);

                    let userStatus = {};
                    userStatus[Schema.USER_TABLE_SCHEMA.FIELDS.STATUS] = STATUS_USER.NEED_CONDO;
                    userStatus[Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID] = ROLE.USER;
                    let updateUser = UserRepository.updateByQuery(q => {
                        q.where(Schema.USER_TABLE_SCHEMA.FIELDS.ID, userUnit.userId);
                    }, userStatus);

                    let removeSession = SessionService.deleteSessionByUserId(userUnit.userId);

                    return Promise.all([updateUserUnit, updateUser, removeSession]);
                }));
            });
    }

    public tenancyExpirySchedule(): Promise<any> {
        return Promise.resolve()
        .then(() => {
            this.archiveTenancyExpiry();
            this.reminderTenancyExpiry();
        });
    }

    public archiveTenancyExpiry(): Promise<UserUnitModel[]> {
        let currentDate = new Date().toISOString();
        return UserUnitRepository.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.TENANT);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.TENANCY_EXPIRY, "<=", currentDate);
        })
        .then(userUnits => {
            return Promise.each(userUnits, (userUnit => {
                userUnit.status = STATUS_REQUEST_USER.ARCHIVED;
                let updateUserUnit = this.update(userUnit);

                let userStatus = {};
                userStatus[Schema.USER_TABLE_SCHEMA.FIELDS.STATUS] = STATUS_USER.NEED_CONDO;
                userStatus[Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID] = ROLE.USER;
                let updateUser = UserRepository.updateByQuery(q => {
                    q.where(Schema.USER_TABLE_SCHEMA.FIELDS.ID, userUnit.userId);
                }, userStatus);

                let removeSession = SessionService.deleteSessionByUserId(userUnit.userId);

                return Promise.all([updateUserUnit, updateUser, removeSession]);
            }));
        });
    }

    public reminderTenancyExpiry(): Promise<UserUnitModel[]> {
        let d = new Date();
        let m = d.getMonth();
        d.setMonth(d.getMonth() + 1);
        let remindDate = d.toISOString();
        return UserUnitRepository.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.TENANT);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.TENANCY_EXPIRY, "<=", remindDate);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.HAD_EXPIRED_REMINDER, false);
        }, ["user", "condo"])
        .then(userUnits => {
            return Promise.each(userUnits, (userUnit => {
                return UserManagerService.findByCondoId(userUnit.condoId, ["user"])
                .then(userManager => {
                    if (!userManager) {
                        return new ExceptionModel(
                            ErrorCode.RESOURCE.USER_INVALID.CODE,
                            ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST
                        );
                    } else {
                        Mailer.sendRemindTenancyExpiry(userUnit, userManager)
                        .then(() => {
                            let userUnitStatus = {};
                            userUnitStatus[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.HAD_EXPIRED_REMINDER] = true;
                            return UserUnitRepository.updateByQuery(q => {
                                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID, userUnit.id);
                            }, userUnitStatus);
                        })
                        .catch(err => Logger.error(err.message, err));
                    }
                });
            }));
        });
    }

    /**
     * [PORTAL]: check role of the unit
     * @param unitId
     * @returns {Bluebird<any>}
     */
    public checkRole(unitId: string, roleId: string): Promise<any> {
        let result = {
            hasUser: false,
            hasMaster: false,
            isResident: false,
            tenancyExpiry: null
        };
        return UserUnitRepository.listAllUserByUnit(unitId)
            .then(userUnits => {
                result.hasUser = userUnits.length > 0;
                userUnits.forEach(userUnit => {
                    if (userUnit.roleId === roleId && userUnit.isMaster) {
                        result.hasMaster = true;
                        result.isResident = userUnit.isResident;
                        result.tenancyExpiry = userUnit.tenancyExpiry;
                    }
                });
                return result;
            });
    }

    /**
     * find by condoId
     * @param condoId
     * @returns {Promise<UserUnitModel[]>}
     */
    public findByCondoId(condoId: string) {
        return UserUnitRepository.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        });
    }

    /**
     * find by userId
     * @param userId
     * @returns {Promise<UserUnitModel>}
     */
    public findByUserId(userId: string): Promise<UserUnitModel> {
        return UserUnitRepository.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, ["user"])
            .then(userUnits => {
                return userUnits[0];
            });
    }

    public checkUserAndResident(condoId: string, userId: string): Promise<any> {
        return Promise.resolve()
            .then(() => {
                return UserUnitRepository.findByQuery(q => {
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
                });
            })
            .then((object) => {
                let userUnit: UserUnitModel;

                if (object == null || object.length === 0) {
                    throw new ExceptionModel(
                        ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.CODE,
                        ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.MESSAGE,
                        false,
                        HttpStatus.FORBIDDEN,
                    );
                }

                // Only support for CM and the resident user.
                userUnit = object[0];

                if (userUnit.isResident) {
                    return true;
                } else {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.PRIVILEGE.SUPPORT_ONLY_FOR_RESIDENT_USER.CODE,
                        ErrorCode.PRIVILEGE.SUPPORT_ONLY_FOR_RESIDENT_USER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
            });
    }

    /**
     * Update counter of new user.
     *
     * @param condoId
     * @param isIncrease
     * @returns {Bluebird<U>}
     */
    private updateCounterUser(condoId: string, isIncrease: boolean = true): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
            .then(() => {
                return fb.database().ref(`counter/${condoId}`)
                    .once("value")
                    .then((dataSnapshot) => {
                        let counter = {
                            newUser: 0
                        };

                        if (dataSnapshot != null && dataSnapshot.val() != null && dataSnapshot.val().newUser !== null) {
                            if (isIncrease) {
                                counter.newUser = dataSnapshot.val().newUser + 1;
                            } else {
                                counter.newUser = dataSnapshot.val().newUser > 0 ? dataSnapshot.val().newUser - 1 : 0;
                            }
                        } else {
                            if (isIncrease) {
                                counter.newUser = 1;
                            }
                        }

                        return fb.database().ref("counter").child(`${condoId}`)
                            .update(counter)
                            .catch(err => Logger.error(err.message, err));
                    }).catch(err => Logger.error(err.message, err));
            })
            .catch(err => err => Logger.error(err.message, err));
    }

    public findByListUnitId(condoId: string, isResidenceOwners: boolean, isResidenceTenants: boolean, isNonResidence: boolean, listUnitIds: string[]) {
        if (isResidenceOwners || isResidenceTenants || isNonResidence) {
            return UserUnitRepository.findByQuery(q => {
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                q.whereIn(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, listUnitIds);
                if (isResidenceOwners && !isResidenceTenants && !isNonResidence) {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, true);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.OWNER);
                }
                else if (!isResidenceOwners && isResidenceTenants && !isNonResidence) {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, true);
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.TENANT);
                }
                else if (!isResidenceOwners && !isResidenceTenants && isNonResidence) {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, false);
                }
                else if (isResidenceOwners && isResidenceTenants && !isNonResidence) {
                    q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, true);
                }
                else if (isResidenceOwners && !isResidenceTenants && isNonResidence) {
                    q.where(q1 => {
                        q1.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.OWNER);
                        q1.orWhere(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, false);
                    });
                }
                else if (!isResidenceOwners && isResidenceTenants && isNonResidence) {
                    q.where(q1 => {
                        q1.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, ROLE.TENANT);
                        q1.orWhere(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT, false);
                    });
                }
            });
        }
        return null;
    }

    public countNewStatusByCondo() {
        return UserUnitRepository.countNewStatusByCondo();
    }

    public setCounter(condoId: string, counter: number): Promise<any> {
        // Counter the new online form requesr, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();
        return Promise.resolve()
            .then(() => {
                return fb.database().ref("counter").child(`${condoId}`)
                    .update({
                        newUser: counter
                    })
                    .catch(err => Logger.error(err.message, err));
            }).catch(err => Logger.error(err.message, err));
    }

    public resetCounter() {
        return this.countNewStatusByCondo()
        .then(list => {
            Logger.info(`Count New Status by Condo: ${list}`);
            return Promise.each(list, data => {
                return this.setCounter(data["condo_id"], parseInt(data["newcount"]));
            });
        });
    }
}

export default UserUnitService;
