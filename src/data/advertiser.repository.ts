/**
 * Created by thanhphan on 4/12/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import * as Knex from "knex";
import {BaseRepository} from "./base.repository";
import {AdvertiserDto} from "./sql/models";
import {AdvertiserModel} from "../models";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, PROPERTIES} from "../libs/constants";

export class AdvertiserRepository extends BaseRepository<AdvertiserDto, AdvertiserModel> {
    constructor() {
        super(AdvertiserDto, AdvertiserModel, {
            fromDto: AdvertiserModel.fromDto,
            toDto: AdvertiserModel.toDto,
        });
    }

    /**
     * Get list advertisers in the iCondo network.
     *
     * @param queryParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<AdvertiserModel[]>}
     */
    public getAllAdvertisers(queryParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertiserModel>> {
        let keySearch = queryParams.key || null;
        let orderBy = queryParams.orderBy || Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME;
        let orderType = queryParams.orderType || "ASC";
        limit = limit || null;
        offset = offset || null;

        let query = (isOrder?: boolean, offset?: number, limit?: number) => {
            return (q): void => {
                q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);

                if (keySearch != null) {
                    q.where(q1 => {
                        q1.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.CONTACT_NAME, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.MOBILE_NUMBER, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.EMAIL, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.WEBSITE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.POSTAL_CODE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.DESCRIPTION, "ILIKE", `%${keySearch}%`);
                    });
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder) {
                    q.orderByRaw(`lower(${orderBy}) ${orderType}`);
                }
            };
        };

        return this.countAndQuery(query(), query(true, offset, limit), related, filters);
    }

    /**
     * Function search list partner by sub-category.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Bluebird<CollectionWrap<AdvertiserModel>>}
     */
    public getListPartners(searchParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertiserModel>> {
        let subCategoryId = searchParams.subCategoryId || null;

        limit = limit || null;
        offset = offset || null;

        let query = (isOrderBy?: boolean, offset?: number, limit?: number, isCount: boolean = true) => {
            return (q): void => {
                if (isCount) {
                    q.select(AdvertiserDto.knex().raw(`COUNT(DISTINCT ${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID}) AS ${PROPERTIES.COLUMN_TOTAL_ITEMS}`));
                }

                // Join with Advertising to Condo
                q.leftJoin(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME,
                    `${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID}`,
                    `${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID}`);

                // Filter by sub-category
                q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID}`, subCategoryId);

                // Filters with records available.
                q.where(`${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);

                q.groupBy(`${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID}`);

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrderBy) {
                    q.orderBy(`${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME}`, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<AdvertiserModel>();

        return Promise.resolve()
            .then(() => {
                return new this.dto().query(query()).fetch();
            })
            .then(result => {
                if (result != null && result.get(`${PROPERTIES.COLUMN_TOTAL_ITEMS}`) != null) {
                    ret.total = result.get(`${PROPERTIES.COLUMN_TOTAL_ITEMS}`);
                }

                return this.findByQuery(query(true, offset, limit, false), related, filters);
            })
            .then((objects) => {
                ret.data = objects;

                return ret;
            });
    }

    /**
     * Function get advertiser by id or email.
     *
     * @param id
     * @param email
     * @returns {Promise<AdvertiserModel>}
     */
    public getAdvertiserBy(id: string, email?: string): Promise<AdvertiserModel> {
        return this.findOneByQuery(q => {
            if (id != null && id !== "") {
                q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID, id);
            }

            if (email != null && email !== "") {
                q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.EMAIL, email);
            }

            q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }
}

export default AdvertiserRepository;
