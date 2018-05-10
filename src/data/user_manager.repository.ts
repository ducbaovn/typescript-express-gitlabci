/**
 * Created by davidho on 3/3/17.
 */

import {BaseRepository} from "./base.repository";
import {UserManagerDto} from "./sql/models";
import {UserManagerModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class UserManagerRepository extends BaseRepository<UserManagerDto, UserManagerModel> {
    constructor() {
        super(UserManagerDto, UserManagerModel, {
            fromDto: UserManagerModel.fromDto,
            toDto: UserManagerModel.toDto,
        });
    }

    /**
     * search User Manager
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UserManagerModel>> {
        let keyword = searchParams.key || null;
        let roles = searchParams.roles || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q): void => {
                q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
                q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
                q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                q.leftJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`);
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.AGENT}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME}`, "ILIKE", `%${keyword}%`);
                    });
                }

                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy) {
                    let orderBy = searchParams.orderBy || `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`;
                    let orderType = searchParams.orderType || "ASC";
                    q.orderByRaw(`lower(${orderBy}) ${orderType}`);
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    /**
     * count count the condo is being managed
     * @param condoId
     */
    public countCondoManager(condoId: string, userId?: string): Promise<number> {
        return this.countByQuery(q => {
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            if (userId) {
                q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID, "<>", userId);
            }
        });
    }

}
export  default UserManagerRepository;
