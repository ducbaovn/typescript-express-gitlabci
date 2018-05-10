import {BaseRepository} from "./base.repository";
import {OnlineFormSubCategoryTemplateDto} from "./sql/models";
import {OnlineFormSubCategoryTemplateModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class OnlineFormSubCategoryTemplateRepository extends BaseRepository<OnlineFormSubCategoryTemplateDto, OnlineFormSubCategoryTemplateModel> {
    constructor() {
        super(OnlineFormSubCategoryTemplateDto, OnlineFormSubCategoryTemplateModel, {
            fromDto: OnlineFormSubCategoryTemplateModel.fromDto,
            toDto: OnlineFormSubCategoryTemplateModel.toDto,
        });
    }

    /**
     * list online form active by condo
     * @param condoId
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<OnlineFormCategoryModel>>}
     */

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<OnlineFormSubCategoryTemplateModel>> {

        let keyword = searchParams.key || null;
        let onlineFormCategoryTemplateId = searchParams.categoryId || null;

        let ret = new CollectionWrap<OnlineFormSubCategoryTemplateModel>();
        return Promise.resolve()
            .then(() => {
                return this.findByQuery(q => {
                    q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    if (onlineFormCategoryTemplateId !== null) {
                        q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID, onlineFormCategoryTemplateId);
                    }
                    q.orderBy(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME, "ESC");
                }, related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }
}
export default OnlineFormSubCategoryTemplateRepository;
