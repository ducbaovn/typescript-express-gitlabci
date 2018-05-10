/**
 * Created by davidho on 2/14/17.
 */

import {BaseRepository} from "./base.repository";
import {FeedbackDto} from "./sql/models";
import {FeedbackModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, SORT_FIELDS, FEEDBACK_STATUS} from "../libs/constants";
import {CollectionWrap} from "../models/collections";
import { filter } from "bluebird";
export class FeedbackRepository extends BaseRepository<FeedbackDto, FeedbackModel> {
    constructor() {
        super(FeedbackDto, FeedbackModel, {
            fromDto: FeedbackModel.fromDto,
            toDto: FeedbackModel.toDto,
        });
    }

    /**
     * search Announcement
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<FeedbackModel>> {
        let limit = parseInt(searchParams.limit) || null;
        let offset = parseInt(searchParams.offset) || null;

        let keyword = searchParams.key || null;
        let userId = searchParams.userId || null;
        let categoryId = searchParams.categoryId || null;
        let condoId = searchParams.condoId || null;
        let unitId = searchParams.unitId || null;
        let status = searchParams.status || null;
        let sortBy = searchParams.sortBy;
        let sortType = searchParams.sortType || "DESC";

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (keyword) {
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.USER_ID}`);
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME, `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UNIT_ID}`);
                    q.where(q1 => {
                        q1.where(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TITLE}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TICKET_NUMBER}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                }
                if (userId != null) {
                    q.andWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }
                if (categoryId != null) {
                    q.andWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID}`, categoryId);
                }
                if (condoId != null) {
                    q.andWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }
                if (unitId != null) {
                    q.andWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UNIT_ID}`, unitId);
                }
                if (status != null) {
                    q.andWhere(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS}`, status);
                }
                q.where(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);

                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrder != null) {
                    switch (sortBy) {
                        case SORT_FIELDS.FEEDBACK.DATE_RECEIVED: {
                            sortBy = `${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED}`;
                            break;
                        }
                        case SORT_FIELDS.FEEDBACK.CATEGORY_NAME: {
                            q.innerJoin(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME, `${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID}`);
                            sortBy = `${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}`;
                            break;
                        }
                        default:
                            sortBy = `${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UPDATED_DATE}`;
                            break;
                    }
                    q.orderBy(sortBy, sortType);
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    public getMaxTicketNumber(condoId: string) {
        return this.rawQuery(`SELECT MAX(ticket_number) FROM feedback WHERE condo_id = '${condoId}';`)
        .then(result => {
            return result[0]["max"];
        });
    }
}
export  default FeedbackRepository;
