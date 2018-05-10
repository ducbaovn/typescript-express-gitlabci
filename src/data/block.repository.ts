/**
 * Created by davidho on 3/27/17.
 */

import {BaseRepository} from "./base.repository";
import {BlockDto} from "./sql/models";
import {BlockModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_REQUEST_USER} from "../libs/constants";

export class BlockRepository extends BaseRepository<BlockDto, BlockModel> {
    constructor() {
        super(BlockDto, BlockModel, {
            fromDto: BlockModel.fromDto,
            toDto: BlockModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<BlockModel>> {
        let condoId = searchParams.condoId || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q): void => {
                q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.andWhere(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (condoId != null) {
                    q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy) {
                    q.orderBy(Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER, "ASC");
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    public unregisteredUnit(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<BlockModel>> {
        let condoId = searchParams.condoId || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q): void => {
                q.innerJoin(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME,
                    `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID}`,
                    `${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME}.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}`);

                q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME,
                    `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID}`,
                    `${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME}.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}`);

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

                q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID}`, null);
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
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export  default BlockRepository;
