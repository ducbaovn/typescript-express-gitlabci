/**
 * Created by davidho on 4/13/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import Redis from "../data/redis/redis";
import { BaseRepository } from "./base.repository";
import { CollectionWrap } from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, FEED_TYPE, STATUS_REQUEST_USER} from "../libs/constants";
import { GarageSaleDto } from "./sql/models";
import { GarageSaleModel } from "../models";
import { Logger } from "../libs/index";
import { QueryBuilder } from "knex";

export class GarageSaleRepository extends BaseRepository<GarageSaleDto, GarageSaleModel> {
    constructor() {
        super(GarageSaleDto, GarageSaleModel, {
            fromDto: GarageSaleModel.fromDto,
            toDto: GarageSaleModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<GarageSaleModel>> {
        let keyword = searchParams.key || null;
        let category = searchParams.category || null;
        let userId = searchParams.userId || null;
        let type = searchParams.type || null;
        let isEnable = searchParams.isEnable || null;
        let isMyListing = parseInt(searchParams.isMyListing) || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                q.where(`${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);

                if (isEnable != null) {
                    q.where(`${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, isEnable);
                }

                if (searchParams.key && searchParams.key !== "") {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID}`, `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`);
                    q.where(q1 => {
                        q1.where(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TITLE, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                    q.andWhere(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
                }
                if (category) {
                    q.whereIn(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.GARAGE_SALE_CATEGORY_ID, category.split(","));
                }
                if (type) {
                    q.andWhere(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TYPE, type);
                }

                if (isMyListing != null) {
                    q.andWhere(`${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }

                if (searchParams.condoArr != null && searchParams.condoArr.length > 0) {
                    q.whereIn(`${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID}`, searchParams.condoArr);
                } else if (searchParams.condoId != null) {
                    q.andWhere(`${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID}`, searchParams.condoId);
                }

                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    q.orderBy(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.DATE_POST, "DESC");
                }
            };
        };

        let ret = new CollectionWrap<GarageSaleModel>();
        return this.countAndQuery(query(), query(offset, limit, true), related, filters)
            .then(result => {
                ret = result;

                let multi = Redis.getClient().multi();
                ret.data.forEach(item => {
                    let key = Redis.getFeedLikeKey(FEED_TYPE.GARAGE_SALE, item.id);
                    multi.scard(key);
                    multi.sismember(key, userId);
                });

                return multi.execAsync();
            })
            .then((object: number[]) => {
                if (object != null && object.length === ret.data.length * 2) {
                    for (let i = 0; i < ret.data.length; i++) {
                        ret.data[i].numberOfLike = object[i * 2];
                        ret.data[i].isLike = !!object[i * 2 + 1];
                    }
                }
                return ret;
            });
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Promise<GarageSaleModel>}
     */
    public findById(id: string, related = [], filters = [], userId?: string): Promise<GarageSaleModel> {
        let garageSaleInfo: GarageSaleModel;
        return this.findOneByQuery(q => {
            q.where(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.ID, id);
        }, related, filters)
            .then(object => {
                if (object != null) {
                    garageSaleInfo = object;
                    let multi = Redis.getClient().multi();
                    let key = Redis.getFeedLikeKey(FEED_TYPE.GARAGE_SALE, object.id);
                    multi.scard(key);
                    if (userId) {
                        multi.sismember(key, userId);
                    }
                    return multi.execAsync();
                }
                return Promise.resolve(null);
            })
            .then((data: number[]) => {
                if (garageSaleInfo) {
                    if (data && data.length > 0) {
                        garageSaleInfo.numberOfLike = data[0];
                        garageSaleInfo.isLike = !!data[1];
                    }
                    return garageSaleInfo;
                }
                return Promise.resolve(null);
            });
    }

}
export default GarageSaleRepository;
