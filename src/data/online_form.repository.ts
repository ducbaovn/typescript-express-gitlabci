/**
 * Created by davidho on 2/9/17.
 */

import {BaseRepository} from "./base.repository";
import {OnlineFormDto} from "./sql/models";
import {OnlineFormModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
import {CollectionWrap} from "../models/collections";
export class OnlineFormRepository extends BaseRepository<OnlineFormDto, OnlineFormModel> {
    constructor() {
        super(OnlineFormDto, OnlineFormModel, {
            fromDto: OnlineFormModel.fromDto,
            toDto: OnlineFormModel.toDto,
        });
    }



    /**
     * list online form active by condo
     * @param condoId
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<OnlineFormModel>>}
     */

    public search(searchParams: any = {}, related = [], filters = []): Promise<CollectionWrap<OnlineFormModel>> {

        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;

        let ret = new CollectionWrap<OnlineFormModel>();
        return Promise.resolve()
            .then(() => {
                return this.findByQuery(q => {
                    q.where(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);

                    if (condoId !== null) {
                        q.andWhere(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                    }
                    q.orderBy(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.NAME, "ESC");
                }, related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }
}
export  default OnlineFormRepository;
