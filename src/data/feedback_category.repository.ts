/**
 * Created by davidho on 2/14/17.
 */

import {BaseRepository} from "./base.repository";
import {FeedbackCategoryDto} from "./sql/models";
import {CollectionWrap, FeedbackCategoryModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
export class FeedbackCategoryRepository extends BaseRepository<FeedbackCategoryDto, FeedbackCategoryModel> {
    constructor() {
        super(FeedbackCategoryDto, FeedbackCategoryModel, {
            fromDto: FeedbackCategoryModel.fromDto,
            toDto: FeedbackCategoryModel.toDto,
        });
    }

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<FeedbackCategoryModel>> {
        let limit = parseInt(searchParams.limit) || null;
        let offset = parseInt(searchParams.offset) || null;

        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let unitId = searchParams.unitId || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                q.where(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.EMAIL, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId != null) {
                    q.andWhere(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrder != null) {
                    q.orderBy(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX, "ASC");
                    q.orderBy(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ASC");
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    public list(searchParams: any = {}, related = [], filters = []): Promise<FeedbackCategoryModel[]> {
        let keyword = searchParams.key || null;
        let name = searchParams.name || null;
        let condoId = searchParams.condoId || null;

        let query = () => {
            return (q): void => {
                q.where(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (name != null) {
                    q.where(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, name);
                }
                if (condoId != null) {
                    q.andWhere(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }
                q.orderBy(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX, "ASC");
                q.orderBy(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ASC");
            };
        };

        return this.findByQuery(query(), related, filters);
    }
}
export  default FeedbackCategoryRepository;
