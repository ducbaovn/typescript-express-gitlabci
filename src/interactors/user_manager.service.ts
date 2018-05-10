import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import { ExceptionModel, UserModel, SessionModel, UserManagerModel, CollectionWrap } from "../models";
import { UserRepository, UserManagerRepository, SessionRepository, CondoRepository } from "../data";
import { UserService, SessionService } from "./";
import BaseService from "./base.service";
import { HttpStatus, Jwt, ErrorCode } from "../libs";
import { ROLE } from "../libs/constants";


/**
 * Created by baond on 14/4/17.
 */
export class UserManagerService extends BaseService<UserManagerModel, typeof UserManagerRepository> {

    constructor() {
        super(UserManagerRepository);
    }

    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UserManagerModel>> {
        return UserManagerRepository.search(params, offset, limit, related, filters);
    }

    public findByUserId(userId: string, related = [], filters = []): Promise<UserManagerModel> {
        return UserManagerRepository.findByQuery(q => {
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, related, filters)
        .then(userManagers => {
            return userManagers[0];
        });
    }

    /**
     * Delete logic user who not manage any condo or remove user_manager link condo
     * @param id userId
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public deleteByUserId(id: string, related = [], filters = []): Promise<boolean> {
        return UserRepository.findOne(id, ["condoManager"])
        .then(user => {
            if (!user.condoManager) {
                return UserRepository.deleteLogic(id)
                .then(object => {
                    // Clear session;
                    return SessionRepository.deleteByQuery(q => {
                        q.where(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID, object.id);
                    })
                    .then(() => {
                        return true;
                    });
                });
            }
            let deleteLogic = {
                is_deleted: true
            };
            return UserManagerRepository.updateByQuery(q => {
                q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID, id);
            }, deleteLogic)
            .then(() => {
                return true;
            });
        });
    };

    /**
     * verify condo: check condo active
     * check the condo is being managed by noone
     * @param user
     * @returns {Bluebird<boolean>}
     */
    public verifyCondoOfCondoManager(user: UserModel): Promise<boolean> {
        return CondoRepository.findOne(user.condoId)
        .then(condo => {
            if (condo === null || condo.isEnable === false || condo.isDeleted === true) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                );
            }
            return UserManagerRepository.countCondoManager(user.condoId, user.id); // at the same time, only 1 condo manager manage 1 condo
        })
        .then(count => {
            if (count > 0) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_CANNOT_MANAGER.CODE,
                    ErrorCode.RESOURCE.CONDO_CANNOT_MANAGER.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                );
            }
            return true;
        });
    }

    public create(userId: string, condoId: string) {
        return CondoRepository.findOne(condoId)
        .then(condo => {
            if (condo === null || condo.isEnable === false || condo.isDeleted === true) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                );
            }
            let userManager = new UserManagerModel();
            userManager.condoId = condoId;
            userManager.userId = userId;
            return UserManagerRepository.insert(userManager);
        });
    }

    public removeCondo(userManagerId: string): Promise<string> {
        return Promise.resolve()
        .then(() => {
            if (!userManagerId) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                );
            }

            return this.findOne(userManagerId);
        })
        .then(userManager => {
            if (!userManager) {
                throw new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED
                );
            }
            userManager.condoId = null;
            return UserManagerRepository.update(userManager)
            .then(userManagerDto => {
                let user = new UserModel();
                user.id = userManager.userId;
                user.roleId = ROLE.USER;
                return UserService.adminUpdate(user);
            });
        })
        .then(userDto => {
            return SessionService.deleteSessionByUserId(userDto.id);
        })
        .then(() => {
            return userManagerId;
        });
    }

    public findByCondoId(condoId: string, related = [], filters = []): Promise<UserManagerModel> {
        return UserManagerRepository.findByQuery(q => {
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        }, related, filters)
        .then(userManagers => {
            return userManagers[0];
        });
    }
}

export default UserManagerService;
