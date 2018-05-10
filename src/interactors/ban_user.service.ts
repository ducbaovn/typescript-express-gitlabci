/**
 * Created by davidho on 4/13/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {
    CollectionWrap, BanUserModel, ExceptionModel,
} from "../models";
import {
    BanUserRepository
} from "../data";
import {ErrorCode, HttpStatus} from "../libs/index";
import {BanUserDto} from "../data/sql/models";

export class BanUserService extends BaseService<BanUserModel, typeof BanUserRepository> {
    constructor() {
        super(BanUserRepository);
    }

    /**
     *
     * @param banUser
     * @param related
     * @param filters
     * @returns {any}
     */
    public create(banUser: BanUserModel, related = [], filters = []): Promise<BanUserModel> {
        if (banUser != null) {
            return BanUserRepository.findBanUserByTypeAndUserId(banUser.type, banUser.userId)
                .then(object => {
                    if (object !== null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.BAN_USER_EXIST.CODE,
                            ErrorCode.RESOURCE.BAN_USER_EXIST.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }

                    return BanUserRepository.insertGet(banUser);
                });
        }

        return Promise.resolve(null);
    }

    /**
     *
     * @param banUser
     * @param related
     * @param filters
     * @returns {any}
     */
    public update(banUser: BanUserModel, related = [], filters = []): Promise<BanUserDto> {
        if (banUser != null) {
            return this.findBanUserById(banUser.id)
                .then(() => {
                    return BanUserRepository.update(banUser);
                });

        }

        return Promise.resolve(null);
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<BanUserModel>>}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<BanUserModel>> {
        return BanUserRepository.search(searchParams, offset, limit, related, filters);
    }


    /**
     *
     * @param id
     * @returns {Bluebird<boolean>}
     */
    public removeById(id: string): Promise<boolean> {
        return this.findBanUserById(id)
            .then(object => {
                return BanUserRepository.deleteLogic(object.id);
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
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public findBanUserById(id: string, related = [], filters = []): Promise<any> {
        return BanUserRepository.findById(id, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                return object;
            });
    }

    /**
     *
     * @param type
     * @param userUd
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public findBanUserByTypeAndUserId(type: string, userId: string, related = [], filters = []): Promise<any> {
        return BanUserRepository.findBanUserByTypeAndUserId(type, userId, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.BAN_USER_EXIST.CODE,
                        ErrorCode.RESOURCE.BAN_USER_EXIST.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                return object;
            });
    }
}

export default BanUserService;
