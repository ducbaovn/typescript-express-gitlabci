/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {BanUserDto} from "./sql/models";
import {BanUserModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_REQUEST_USER} from "../libs/constants";

export class BanUserRepository extends BaseRepository<BanUserDto, BanUserModel> {
    constructor() {
        super(BanUserDto, BanUserModel, {
            fromDto: BanUserModel.fromDto,
            toDto: BanUserModel.toDto,
        });
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<BanUserModel>>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<BanUserModel>> {
        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let type = searchParams.type || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                q.where(`${Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                q.where(`${Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, DELETE_STATUS.YES);

                if (keyword != null) {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`);
                    q.where(q1 => {
                        q1.andWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                    q.andWhere(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
                }

                if (type != null) {
                    q.andWhereRaw(`LOWER(${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.TYPE}) = LOWER('${type}')`);
                }

                if (condoId != null) {
                    q.andWhere(`${Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    q.orderBy(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CREATED_DATE, "DESC");
                }
            };
        };

        let ret = new CollectionWrap<BanUserModel>();

        return this.countByQuery(query())
            .then((total) => {
                ret.total = total;

                return this.findByQuery(query(offset, limit, true), related, filters);
            })
            .then((objects) => {
                ret.data = objects;

                return ret;
            });

    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public findById(id: string, related = [], filters = []): Promise<BanUserModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.ID, id);
        }, related, filters);
    }

    /**
     *
     * @param type
     * @param userId
     * @param related
     * @param filters
     * @returns {Promise<BanUserModel>}
     */
    public findBanUserByTypeAndUserId(type: string, userId: string, related = [], filters = []): Promise<BanUserModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID, userId);
            q.andWhere(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.TYPE, type);
        }, related, filters);
    }


}
export  default BanUserRepository;
