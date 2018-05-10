/**
 * Created by ducbaovn on 08/05/17.
 */

import {BaseRepository} from "./base.repository";
import {MovingDto} from "./sql/models";
import {MovingModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS, MOMENT_DATE_FORMAT} from "../libs/constants";
import {CollectionWrap} from "../models/collections";
import {Utils} from "../libs/utils";

export class MovingRepository extends BaseRepository<MovingDto, MovingModel> {
    constructor() {
        super(MovingDto, MovingModel, {
            fromDto: MovingModel.fromDto,
            toDto: MovingModel.toDto,
        });
    }

    /**
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<MovingModel>>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<MovingModel>> {
        let startDateStart;
        let startDateEnd;
        try {
            startDateStart = searchParams.startDateStart ? Utils.dateByFormat(searchParams.startDateStart) : null;
            startDateEnd = searchParams.startDateEnd ? Utils.dateByFormat(searchParams.startDateEnd) : null;
        } catch (error) {
            return Promise.reject(error);
        }
        let orderType = searchParams.orderType || "ASC";
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (searchParams.id) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.ID, searchParams.id);
                }
                if (searchParams.condoId) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID, searchParams.condoId);
                }
                if (searchParams.type) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.TYPE, searchParams.type);
                }
                if (searchParams.status) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS, searchParams.status);
                }
                if (searchParams.key) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.FIRST_NAME, "ILIKE", `%${searchParams.key}%`);
                    q.orWhere(Schema.MOVING_TABLE_SCHEMA.FIELDS.LAST_NAME, "ILIKE", `%${searchParams.key}%`);
                    q.orWhere(Schema.MOVING_TABLE_SCHEMA.FIELDS.EMAIL, "ILIKE", `%${searchParams.key}%`);
                    q.orWhere(Schema.MOVING_TABLE_SCHEMA.FIELDS.PHONE_NUMBER, "ILIKE", `%${searchParams.key}%`);
                }
                if (startDateStart) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE, ">=", startDateStart);
                }
                if (startDateEnd) {
                    q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE, "<", startDateEnd);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE, orderType);
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default MovingRepository;
