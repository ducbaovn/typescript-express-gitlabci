/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {BaseRepository} from "./base.repository";
import {UsefulContactsCategoryDto} from "./sql/models";
import {UsefulContactsCategoryModel, CollectionWrap} from "../models";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
import {PromisifyOptions} from "bluebird";

export class UsefulContactsCategoryRepository extends BaseRepository<UsefulContactsCategoryDto, UsefulContactsCategoryModel> {
    constructor() {
        super(UsefulContactsCategoryDto, UsefulContactsCategoryModel, {
            fromDto: UsefulContactsCategoryModel.fromDto,
            toDto: UsefulContactsCategoryModel.toDto,
        });
    }

    /**
     * Get list useful contacts by condo.
     *
     * @param queryParams
     * @param related
     * @param filters
     * @returns {Bluebird<UsefulContactsCategoryModel[]>}
     */
    public getCategoriesByCondo(queryParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UsefulContactsCategoryModel>> {
        let condoId = queryParams.condoId || null;
        let isAdmin = queryParams.isAdmin || false;

        let findQuery = (offset?: number, limit?: number) => {
            return (q): void => {
                if (condoId != null) {
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                if (!isAdmin) {
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                    q.innerJoin(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID}`, `${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.EXPIRY_DATE}`, ">", new Date());
                    q.groupBy(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                q.orderBy(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY}`, "ASC");
            };
        };

        let countQuery = () => {
            return (q): void => {
                if (condoId != null) {
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }
                if (!isAdmin) {
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                    q.where(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                    q.innerJoin(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID}`, `${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.EXPIRY_DATE}`, ">", new Date());
                    q.groupBy(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
                }
            };
        };
        if (!isAdmin) {
            let ret = new CollectionWrap<UsefulContactsCategoryModel>();
            return this.countFetchByQuery(countQuery())
            .then(count => {
                ret.total = count;
                return this.findByQuery(findQuery(offset, limit), related, filters);
            })
            .then(objects => {
                ret.data = objects;
                return ret;
            });
        }
        return this.countAndQuery(countQuery(), findQuery(offset, limit), related, filters);
    }

    /**
     * Get category detail by id and condo id.
     *
     * @param condoId
     * @param categoryId
     * @param related
     * @param filters
     * @returns {Promise<UsefulContactsCategoryModel>}
     */
    public getCategoryDetailBy(condoId: string, categoryId: string, related = [], filters = []): Promise<UsefulContactsCategoryModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID, categoryId);
            q.where(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        }, related, filters);
    }
}

export default UsefulContactsCategoryRepository;
