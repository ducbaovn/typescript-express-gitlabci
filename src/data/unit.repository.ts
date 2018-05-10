/**
 * Created by davidho on 1/14/17.
 */

import {BaseRepository} from "./base.repository";
import {UnitDto} from "./sql/models";
import {UnitModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_REQUEST_USER} from "../libs/constants";


export class UnitRepository extends BaseRepository<UnitDto, UnitModel> {
    constructor() {
        super(UnitDto, UnitModel, {
            fromDto: UnitModel.fromDto,
            toDto: UnitModel.toDto,
        });
    }

    /**
     *
     * @param condoId
     * @param blockNumber
     * @param floorNumber
     * @param stackNumber
     * @returns {Promise<UnitModel>}
     */
    public findUnit(condoId: string, blockNumber: string, floorNumber: string, stackNumber: string): Promise<UnitModel> {
        return this.findOneByQuery((q) => {
            q.select(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.*`);

            q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);

            q.innerJoin(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`);

            q.innerJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}`);

            q.where(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`, condoId);
            q.andWhereRaw(`lower(${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER}) = '${blockNumber.toLowerCase()}'`);
            q.andWhereRaw(`lower(${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER}) = '${floorNumber.toLowerCase()}'`);
            q.andWhereRaw(`lower(${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER}) = '${stackNumber.toLowerCase()}'`);
            q.andWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.andWhere(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.andWhere(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.andWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UnitModel>> {
        return this.countAndQuery(this.searchQuery(searchParams), this.searchQuery(searchParams, offset, limit, true), related, filters);
    }

    private searchQuery = (searchParams: any = {}, offset?: number, limit?: number, isOrderBy?: boolean) => {
        let condoId = searchParams.condoId || null;
        let unitId = searchParams.unitId || null;
        let keyword = searchParams.key || null;
        limit = limit || null;
        offset = offset || null;

        return (q): void => {
            q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);

            q.innerJoin(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`);

            q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            q.where(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            if (condoId) {
                q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            }
            if (unitId) {
                q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`, unitId);
            }
            if (keyword != null) {
                q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
            }
            if (offset != null) {
                q.offset(offset);
            }
            if (limit != null) {
                q.limit(limit);
            }
            if (isOrderBy) {
                q.orderBy(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ASC");
            }
        };
    }

    private unregisteredQuery = (condoId: string, offset?: number, limit?: number, isOrderBy?: boolean) => {
        return (q): void => {
            q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);

            q.innerJoin(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`);

            let leftJoinObject = {};
            leftJoinObject[`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`] = `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`;
            leftJoinObject[`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`] = this.raw(`false`);
            leftJoinObject[`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE}`] = this.raw(`true`);
            leftJoinObject[`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`] = this.raw(`'${STATUS_REQUEST_USER.APPROVE}'`);
            q.leftJoin(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, leftJoinObject);

            q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            q.where(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);

            q.whereNull(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID}`);

            if (condoId) {
                q.where(`${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            }
            if (offset != null) {
                q.offset(offset);
            }
            if (limit != null) {
                q.limit(limit);
            }
            if (isOrderBy) {
                q.orderBy(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ASC");
            }
        };
    }

    public unregisteredUnit(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UnitModel>> {
        let condoId = searchParams.condoId || null;
        limit = limit || null;
        offset = offset || null;

        return this.countAndQuery(this.unregisteredQuery(condoId), this.unregisteredQuery(condoId, offset, limit, true), related, filters);
    }

    public countTotalUnit(condoId: string): Promise<number> {
        let searchParams = {
            condoId: condoId
        };
        return this.countByQuery(this.searchQuery(searchParams));
    }

    public countRegisteredUnit(condoId: string): Promise<number> {
        let total = 0;
        return this.countTotalUnit(condoId)
        .then(result => {
            total = result;
            return this.countUnregisteredUnit(condoId);
        })
        .then(countUnregistered => {
            return (total - countUnregistered);
        });
    }

    public countUnregisteredUnit(condoId: string): Promise<number> {
        return this.countByQuery(this.unregisteredQuery(condoId));
    }
}
export  default UnitRepository;
