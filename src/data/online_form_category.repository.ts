/**
 * Created by davidho on 2/27/17.
 */

import {BaseRepository} from "./base.repository";
import {OnlineFormCategoryDto} from "./sql/models";
import {OnlineFormCategoryModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class OnlineFormCategoryRepository extends BaseRepository<OnlineFormCategoryDto, OnlineFormCategoryModel> {
    constructor() {
        super(OnlineFormCategoryDto, OnlineFormCategoryModel, {
            fromDto: OnlineFormCategoryModel.fromDto,
            toDto: OnlineFormCategoryModel.toDto,
        });
    }

    /**
     * list online form active by condo
     * @param condoId
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<OnlineFormCategoryModel>>}
     */

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<OnlineFormCategoryModel>> {

        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;

        let ret = new CollectionWrap<OnlineFormCategoryModel>();
        return Promise.resolve()
            .then(() => {
                return this.findByQuery(q => {
                    q.where(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);

                    if (condoId !== null) {
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                    }
                    q.orderBy(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ESC");
                }, related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }
}
export default OnlineFormCategoryRepository;
