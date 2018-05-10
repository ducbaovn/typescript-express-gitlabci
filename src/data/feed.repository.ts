/**
 * Created by davidho on 4/13/17.
 */

import { BaseRepository } from "./base.repository";
import { FeedDto } from "./sql/models";
import { FeedModel } from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import { CollectionWrap } from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_REQUEST_USER, ROLE} from "../libs/constants";
import Redis from "../data/redis/redis";
import { QueryBuilder } from "knex";
export class FeedRepository extends BaseRepository<FeedDto, FeedModel> {
    constructor() {
        super(FeedDto, FeedModel, {
            fromDto: FeedModel.fromDto,
            toDto: FeedModel.toDto,
        });
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<FeedModel>>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<FeedModel>> {
        let keyword = searchParams.key || null;
        let userId = searchParams.userId || null;
        let condoId = searchParams.condoId || null;
        let clusteringCondos = searchParams.condoArr || null;
        let type = searchParams.type || null;
        let roleId = searchParams.roleId || null;
        let isMyListing = parseInt(searchParams.isMyListing) || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                q.where(`${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);

                if (roleId !== ROLE.SYSTEM_ADMIN) {
                    q.andWhere(`${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                }

                if (clusteringCondos != null && clusteringCondos.length > 0) {
                    q.whereIn(`${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.CONDO_ID}`, clusteringCondos);
                } else if (condoId != null) {
                    q.andWhere(`${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                if (isMyListing != null) {
                    q.andWhere(`${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }

                if (keyword != null) {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.FEED_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEED_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                    q.leftJoin(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, this.raw(`
                        ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID} = ${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}
                        AND ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS} = '${STATUS_REQUEST_USER.APPROVE}'
                    `));
                    q.leftJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`);
                    q.where(q1 => {
                        q1.andWhere(Schema.FEED_TABLE_SCHEMA.FIELDS.TITLE, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.FEED_TABLE_SCHEMA.FIELDS.CONTENT, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                }

                if (type != null) {
                    q.andWhereRaw(`LOWER(${Schema.FEED_TABLE_SCHEMA.FIELDS.TYPE}) = LOWER('${type}')`);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    q.orderBy(Schema.FEED_TABLE_SCHEMA.FIELDS.DATE_POST, "DESC");
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default FeedRepository;
