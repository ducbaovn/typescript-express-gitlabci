/**
 * Created by davidho on 1/12/17.
 */

import { BaseRepository } from "./base.repository";
import { CondoDto } from "./sql/models";
import { CondoModel, CollectionWrap } from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class CondoRepository extends BaseRepository<CondoDto, CondoModel> {
    constructor() {
        super(CondoDto, CondoModel, {
            fromDto: CondoModel.fromDto,
            toDto: CondoModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<CondoModel>> {
        let keyword = searchParams.key || null;
        let isEnable = searchParams.isEnable || null;
        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q) => {
                q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (isEnable != null) {
                    q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, searchParams.isEnable);
                }
                if (keyword !== null) {
                    q.where(q1 => {
                        q1.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS1, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS2, "ILIKE", `%${keyword}%`);
                    });
                }
                if (searchParams.id) {
                    q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID, searchParams.id);
                }
                if (searchParams.name) {
                    searchParams.name = searchParams.name.replace(/\W/g, "").toLowerCase();
                    q.whereRaw(`lower(regexp_replace(name, '\\W', '', 'g')) = '${searchParams.name}'`);
                }
                if (limit !== null) {
                    q.limit(limit);
                }
                if (offset !== null) {
                    q.offset(offset);
                }
                if (isOrderBy) {
                    let orderBy = searchParams.orderBy || Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME;
                    let orderType = searchParams.orderType || "ASC";
                    if (orderBy === Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME) {
                        q.orderByRaw(`lower(${orderBy}) ${orderType}`);
                    } else {
                        q.orderByRaw(`${orderBy} ${orderType}`);
                    }
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    /**
     * Check valid condo
     * @param condoId
     * @param blockNumber
     * @param floorNumber
     * @param stackNumber
     * @param related
     * @param filters
     * @returns {Promise<number>}
     */
    public countCondo(condoId: string, blockNumber: string, floorNumber: string, stackNumber: string): Promise<number> {
        return this.countByQuery((q) => {
            q.innerJoin(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}`);

            q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`);

            q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME,
                `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`);

            q.where(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`, condoId);
            q.andWhere(Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER, blockNumber);
            q.andWhere(Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER, floorNumber);
            q.andWhere(Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER, stackNumber);
        });
    }

}

export  default CondoRepository;
