/**
 * Created by davidho on 1/22/17.
 */

import {BaseRepository} from "./base.repository";
import {UserUnitDto} from "./sql/models";
import {UserUnitModel, ExceptionModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {ENABLE_STATUS, DELETE_STATUS, STATUS_REQUEST_USER, SORT_FIELDS} from "../libs/constants";
import {Logger, ErrorCode, HttpStatus} from "../libs/index";

export class UserUnitRepository extends BaseRepository<UserUnitDto, UserUnitModel> {
    constructor() {
        super(UserUnitDto, UserUnitModel, {
            fromDto: UserUnitModel.fromDto,
            toDto: UserUnitModel.toDto,
        });
    }

    /**
     *
     * @param unitId
     * @param roleId
     * @returns {Promise<number>}
     */
    public countUnitInUse(unitId: string, roleId?: string): Promise<number> {
        return this.countByQuery((q) => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, unitId);

            if (roleId != null) {
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, roleId);
            }
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
        });
    }

    /**
     *
     * @param userId
     * @returns {Promise<number>}
     */
    public countUnitOfUser(userId: string): Promise<number> {
        return this.countByQuery((q) => {
            // q.select(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.*`);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, userId);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }

    /**
     * List All User By Unit
     * @param unitId
     * @param related
     * @param filters
     * @returns {Promise<UserUnitModel[]>}
     */
    public listAllUserByUnit(unitId: string, related = [], filters = []): Promise<UserUnitModel[]> {
        return this.findByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
            if (unitId != null) {
                q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, unitId);
            }
        });

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
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UserUnitModel>> {
        let userId = searchParams.userId || null;
        let firstName = searchParams.firstName || null;
        let lastName = searchParams.lastName || null;
        let status = searchParams.status || STATUS_REQUEST_USER.NEW;
        let condoId = searchParams.condoId || null;
        let blockId = searchParams.blockId || null;
        let unitId = searchParams.unitId || null;
        let roleIds = searchParams.roleIds || null;
        let fromTime = searchParams.fromTime || null;
        let toTime = searchParams.toTime || null;
        let keyword = searchParams.key || null;
        let sortBy = searchParams.sortBy;
        let sortType = searchParams.sortType;
        try {
            if (roleIds) {
                roleIds = searchParams.roleIds.split(",");
            }
        } catch (err) {
            throw(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, status);
                if (condoId != null) {
                    q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }
                if (blockId != null) {
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`);
                    q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME, `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);
                    q.where(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`, blockId);
                }
                if (unitId != null) {
                    q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`, unitId);
                }
                if (userId != null) {
                    q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }
                if (firstName || lastName) {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`);
                    if (firstName) {
                        q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", firstName);
                    }
                    if (lastName) {
                        q.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", lastName);
                    }
                }
                if (roleIds != null) {
                    q.whereIn(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID}`, roleIds);
                }
                if (fromTime) {
                    q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, ">", fromTime);
                }
                if (toTime) {
                    q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "<", toTime);
                }
                if (keyword != null) {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`);
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`);
                    q.where(q1 => {
                        q1.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    switch (sortBy) {
                        case SORT_FIELDS.UNIT_LOGS.BLOCK:
                            {
                                if (keyword == null) {
                                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}`);
                                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`);
                                }
                                q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME, `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);
                                q.innerJoin(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME, `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`);
                                q.orderBy(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER}`, sortType);
                            }
                            break;
                        default: {
                            q.orderBy(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "DESC");
                            break;
                        }
                    }

                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    /**
     *
     * @param userId
     * @returns {Promise<number>}
     */
    public updateWithUserId(userId: string, unitId?: string): Promise<any> {
        return this.findOneByQuery(q => {
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, userId);
            if (unitId != null) {
                q.andWhere(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, unitId);
            }

        })
            .then((object) => {
                if (object === null) {
                    return Promise.resolve(null);
                }
                object.isDeleted = DELETE_STATUS.YES;
                return this.update(object).catch(err => {
                    Logger.error(err.message, err);
                    return Promise.resolve(null);
                });
            });
    }

    public updateResidentWithIds(ids: string[], isResident: boolean): Promise<any> {
        let data = {};
        data[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT] = isResident;

        return this.updateByQuery(q => {
            q.whereIn(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, ids);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
        }, data);
    }

    public countNewStatusByCondo() {
        let query = `SELECT ${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID}, COUNT(*) newcount
                FROM ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}
                WHERE ${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS} = '${STATUS_REQUEST_USER.NEW}'
                GROUP BY ${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID};`;
        return this.rawQuery(query);
    }
}
export  default UserUnitRepository;
