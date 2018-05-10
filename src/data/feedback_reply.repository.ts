import {BaseRepository} from "./base.repository";
import {FeedbackReplyDto} from "./sql/models";
import {FeedbackReplyModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, SORT_FIELDS, FEEDBACK_STATUS, FEEDBACK_REPLY_STATUS} from "../libs/constants";
import {CollectionWrap} from "../models/collections";
import { filter } from "bluebird";
export class FeedbackReplyRepository extends BaseRepository<FeedbackReplyDto, FeedbackReplyModel> {
    constructor() {
        super(FeedbackReplyDto, FeedbackReplyModel, {
            fromDto: FeedbackReplyModel.fromDto,
            toDto: FeedbackReplyModel.toDto,
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
    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<FeedbackReplyModel>> {
        let limit = parseInt(searchParams.limit) || null;
        let offset = parseInt(searchParams.offset) || null;

        let keyword = searchParams.key || null;
        let feedbackId = searchParams.feedbackId || null;
        let userId = searchParams.userId || null;
        let sortType = searchParams.sortType || "DESC";

        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                q.where(`${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                if (keyword) {
                    q.innerJoin(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID}`);
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID}`);
                    q.where(q1 => {
                        q1.where(`${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TITLE}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                    });
                }
                if (feedbackId != null) {
                    q.andWhere(`${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID}`, feedbackId);
                }
                if (userId != null) {
                    q.andWhere(`${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrder != null) {
                    q.orderBy(`${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME}.${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.UPDATED_DATE}`, sortType);
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }


}
export  default FeedbackReplyRepository;
