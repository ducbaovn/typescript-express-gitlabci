/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {BaseRepository} from "./base.repository";
import {UsefulSubCategoryTemplateDto} from "./sql/models";
import {UsefulSubCategoryTemplateModel} from "../models/useful_sub_category_template.model";
import {CollectionWrap} from "../models/collections";
import {isBoolean} from "util";

export class UsefulSubCategoryTemplateRepository extends BaseRepository<UsefulSubCategoryTemplateDto, UsefulSubCategoryTemplateModel> {
    constructor() {
        super(UsefulSubCategoryTemplateDto, UsefulSubCategoryTemplateModel, {
            fromDto: UsefulSubCategoryTemplateModel.fromDto,
            toDto: UsefulSubCategoryTemplateModel.toDto,
        });
    }

    /**
     * Find list sub-category by category id template.
     *
     * @param categoryId
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<UsefulSubCategoryTemplateModel>>}
     */
    public getByCategory(categoryId: string, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UsefulSubCategoryTemplateModel>> {
        limit = limit || null;
        offset = offset || null;

        let query = (isOrderBy?: boolean, offset?: number, limit?: number) => {
            return (q): void => {
                q.where(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CATEGORY_ID, categoryId);

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrderBy) {
                    q.orderBy(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<UsefulSubCategoryTemplateModel>();

        return this.countByQuery(query())
            .then((total) => {
                ret.total = total;

                return this.findByQuery(query(true, offset, limit), related, filters);
            })
            .then((objects) => {
                ret.data = objects;

                return ret;
            });
    }
}

export default UsefulSubCategoryTemplateRepository;
