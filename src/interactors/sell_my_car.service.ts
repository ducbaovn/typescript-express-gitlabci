/**
 * Created by ducbaovn on 28/04/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {SellMyCarModel, CollectionWrap} from "../models";
import {SellMyCarRepository, UserRepository} from "../data";
import * as Schema from "../data/sql/schema";
import {ErrorCode, HttpStatus, Mailer} from "../libs/index";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
import {ExceptionModel} from "../models/exception.model";
import * as _ from "lodash";
import {UserModel} from "../models/user.model";


export class SellMyCarService extends BaseService<SellMyCarModel, typeof SellMyCarRepository> {
    constructor() {
        super(SellMyCarRepository);
    }

    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<SellMyCarModel>> {
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (params.key) {
                    q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.EMAIL, "ILIKE", `%${params.key}%`);
                    q.orWhere(Schema.SELL_MY_CAR_SCHEMA.FIELDS.DESCRIPTION, "ILIKE", `%${params.key}%`);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.SELL_MY_CAR_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                }
            };
        };
        return SellMyCarRepository.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    public create(sellMyCars: SellMyCarModel[], related = [], filters = []): Promise<SellMyCarModel[]> {
        if (sellMyCars != null && _.isArray(sellMyCars)) {
            return Promise.resolve()
                .then(() => {
                    return SellMyCarRepository.deleteByQuery(q => {
                        q.whereNot(Schema.SELL_MY_CAR_SCHEMA.FIELDS.ID, null);
                    });
                })
                .then(() => {
                    return Promise
                        .each(sellMyCars, sellMyCar => {
                            return SellMyCarRepository.insert(sellMyCar);
                        });
                });
        }
        return Promise.resolve(null);
    }

    public update(sellMyCar: SellMyCarModel, related = [], filters = []): Promise<SellMyCarModel> {
        if (sellMyCar != null) {
            return SellMyCarRepository.findOne(sellMyCar.id)
                .then(category => {
                    if (category === null || category.isEnable === false || category.isDeleted === true) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    return SellMyCarRepository.update(sellMyCar);
                })
                .then((object) => {
                    return SellMyCarRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    /**
     * @param sellMyCar
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public requestQuote(sellMyCar: SellMyCarModel, related = [], filters = []): Promise<boolean> {
        let userInfo: UserModel;
        return UserRepository.findOne(sellMyCar.userId, ["condo", "unit.floor.block"], filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                userInfo = object;
                return SellMyCarRepository.list();
            })
            .then(objects => {
                // send housing loan request - received
                Mailer.sendSellMyCarRequestReceived(userInfo);
                // send new housing loan request
                objects.forEach(item => {
                    if (item.email) {
                        Mailer.sendNewSellMyCarRequest(item.email, userInfo, sellMyCar);
                    }
                });

                return true;
            });
    }
}

export default SellMyCarService;
