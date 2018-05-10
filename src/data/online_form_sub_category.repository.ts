import {BaseRepository} from "./base.repository";
import {OnlineFormSubCategoryDto} from "./sql/models";
import {OnlineFormSubCategoryModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class OnlineFormSubCategoryRepository extends BaseRepository<OnlineFormSubCategoryDto, OnlineFormSubCategoryModel> {
    constructor() {
        super(OnlineFormSubCategoryDto, OnlineFormSubCategoryModel, {
            fromDto: OnlineFormSubCategoryModel.fromDto,
            toDto: OnlineFormSubCategoryModel.toDto,
        });
    }

    /**
     * list online form sub category active by condo
     * @param condoId
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<OnlineFormSubCategoryModel>>}
     */

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<OnlineFormSubCategoryModel>> {

            let keyword = searchParams.key || null;
            let condoId = searchParams.condoId || null;
            let categoryId = searchParams.categoryId || null;

            let ret = new CollectionWrap<OnlineFormSubCategoryModel>();
            return Promise.resolve()
                .then(() => {
                    return this.findByQuery(q => {
                        q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                        q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        if (condoId !== null) {
                            q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                        }
                        if (categoryId !== null) {
                            q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID, categoryId);
                        }
                        q.orderBy(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ESC");
                    }, related, filters);
                })
                .then((objects) => {
                    ret.data = objects;
                    ret.total = objects.length;
                    return ret;
                });
        }
}
export default OnlineFormSubCategoryRepository;
