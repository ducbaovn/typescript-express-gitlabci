import {BaseRepository} from "./base.repository";
import {UserDto} from "./sql/models";
import {UserModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS, ROLE} from "../libs/constants";
/**
 * Created by davidho on 1/9/17.
 */
export class UserRepository extends BaseRepository<UserDto, UserModel> {
    constructor() {
        super(UserDto, UserModel, {
            fromDto: UserModel.fromDto,
            toDto: UserModel.toDto,
        });
    }

    /**
     *
     * @param email
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public findByEmail(email: string, related = [], filters = []): Promise<UserModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL, email);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        }, related, filters);
    }

    /**
     * search User
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UserModel>> {
        let keyword = searchParams.key || null;
        let roles = searchParams.roles || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q): void => {
                q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
                q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
                if (roles != null) {
                    q.whereIn(Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID, roles);
                    if (roles.indexOf(ROLE.CONDO_MANAGER) !== -1) {
                        q.leftJoin(Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                        q.leftJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`);
                    }
                }
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.AGENT}`, "ILIKE", `%${keyword}%`);
                        if (roles != null && roles.indexOf(ROLE.CONDO_MANAGER) !== -1) {
                            q1.orWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME}`, "ILIKE", `%${keyword}%`);
                        }
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
                    if (!roles || roles.indexOf(ROLE.CONDO_MANAGER) === -1) {
                        orderBy = `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`;
                    }
                    q.orderByRaw(`lower(${orderBy}) ${orderType}`);
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

}
export  default UserRepository;
