import {BaseRepository} from "./base.repository";
import {OnlineFormCategoryTemplateDto} from "./sql/models";
import {OnlineFormCategoryTemplateModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class OnlineFormCategoryTemplateRepository extends BaseRepository<OnlineFormCategoryTemplateDto, OnlineFormCategoryTemplateModel> {
    constructor() {
        super(OnlineFormCategoryTemplateDto, OnlineFormCategoryTemplateModel, {
            fromDto: OnlineFormCategoryTemplateModel.fromDto,
            toDto: OnlineFormCategoryTemplateModel.toDto,
        });
    }

    /**
     * list online form active by condo
     * @param condoId
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<OnlineFormCategoryTemplateModel>>}
     */

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<OnlineFormCategoryTemplateModel>> {

        let keyword = searchParams.key || null;

        let ret = new CollectionWrap<OnlineFormCategoryTemplateModel>();
        return Promise.resolve()
            .then(() => {
                return this.findByQuery(q => {
                    q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    q.orderBy(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME, "ESC");
                }, related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }
}
export default OnlineFormCategoryTemplateRepository;
