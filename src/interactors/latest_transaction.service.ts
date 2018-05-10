/**
 * Created by davidho on 2/7/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, LatestTransactionModel} from "../models";
import {LatestTransactionRepository, CondoRepository, UserUnitRepository} from "../data";
import {ExceptionModel} from "../models/exception.model";
import {ErrorCode, HttpStatus, Logger} from "../libs/index";
import {LATEST_TRANSACTION_TABLE_SCHEMA, USER_UNIT_TABLE_SCHEMA} from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS, LATEST_TRANSACTION_TYPE} from "../libs/constants";
import {PushNotificationService, UserUnitService} from "./index";
import {Redis} from "../data/redis/redis";
import {CondoModel} from "../models/condo.model";

export class LatestTransactionService extends BaseService<LatestTransactionModel, typeof LatestTransactionRepository> {
    constructor() {
        super(LatestTransactionRepository);
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<LatestTransactionModel>> {
        return LatestTransactionRepository.search(searchParams, offset, limit, related, filters);
    }

    public create(latestTransaction: LatestTransactionModel, related = [], filters = []): Promise<LatestTransactionModel> {
        if (latestTransaction != null) {
            return CondoRepository.findOne(latestTransaction.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return LatestTransactionRepository.insert(latestTransaction);
                })
                .then((object) => {
                    return LatestTransactionRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    public update(latestTransaction: LatestTransactionModel, related = [], filters = []): Promise<LatestTransactionModel> {
        if (latestTransaction != null) {
            return CondoRepository.findOne(latestTransaction.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return LatestTransactionRepository.update(latestTransaction);
                })
                .then((object) => {
                    return LatestTransactionRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        let conditions = {};
        let data = {};

        return LatestTransactionRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    /**
     * Push send new latest transaction to user
     * @returns {Bluebird<boolean>}
     */
    public pushNotification(transaction: LatestTransactionModel): Promise<boolean> {
        let condoInfo: CondoModel;
        let salePrice: string = "";
        let rentPrice: string = "";
        return Promise.resolve()
            .then(() => {
                return LatestTransactionRepository.findOneByQuery(q => {
                    q.where(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE, LATEST_TRANSACTION_TYPE.SALE);
                    q.andWhere(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, transaction.condoId);
                    q.orderBy(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE, "DESC");
                }, ["condo"]);
            })
            .then(object => {
                if (object != null) {
                    object = LatestTransactionModel.showPrice([object])[0];
                    salePrice = object.price;
                    condoInfo = object.condo;
                }
                return LatestTransactionRepository.findOneByQuery(q => {
                    q.where(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE, LATEST_TRANSACTION_TYPE.RENT);
                    q.andWhere(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, transaction.condoId);
                    q.orderBy(LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE, "DESC");
                }, ["condo"]);
            })
            .then(object => {
                if (object != null) {
                    object = LatestTransactionModel.showPrice([object])[0];
                    rentPrice = object.price;
                    condoInfo = object.condo;
                }
                if (salePrice !== "" || rentPrice !== "") {
                    return UserUnitService.findByCondoId(transaction.condoId);
                }
            })
            .then(data => {
                if (data && data.length > 0) {
                    let userIds = [];
                    data.forEach(item => {
                        userIds.push(item.userId);
                    });

                    if (userIds.length > 0) {
                        let key = Redis.getLatestTransactionKey(condoInfo.id);
                        let redisValue = `${salePrice}-${rentPrice}`;
                        Redis.getClient().getAsync(key)
                            .then((object) => {
                                if (object !== redisValue) {
                                    PushNotificationService.sendLatestTransaction(userIds, condoInfo.name, salePrice, rentPrice);
                                    return Redis.getClient().setAsync(key, redisValue);
                                }
                            })
                            .catch(err => {
                                Logger.error(err.message, err);
                            });
                    }
                }
                return true;
            });
    }

}

export default LatestTransactionService;
