/**
 * Created by thanhphan on 4/12/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {BaseRepository} from "./base.repository";
import {AdvertisingCondoDto} from "./sql/models";
import {CollectionWrap, AdvertisingCondoModel} from "../models";
import {ADVERTISING_TEMPLATE_TYPE, DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class AdvertisingCondoRepository extends BaseRepository<AdvertisingCondoDto, AdvertisingCondoModel> {
    constructor() {
        super(AdvertisingCondoDto, AdvertisingCondoModel, {
            fromDto: AdvertisingCondoModel.fromDto,
            toDto: AdvertisingCondoModel.toDto,
        });
    }

    /**
     * Get list all template for the condo network.
     *
     * @param queryParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<AdvertisingCondoModel[]>}
     */
    public getAllTemplateByCondo(queryParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertisingCondoModel>> {
        let advertiserId = queryParams.advertiserId || null;
        let templateType = queryParams.templateType || null;
        let categoryId = queryParams.categoryId || null;
        let subCategoryId = queryParams.subCategoryId || null;
        let condoId = queryParams.condoId || null;
        let keyword = queryParams.key || null;

        limit = limit || null;
        offset = offset || null;

        let query = (isOrderBy?: boolean, offset?: number, limit?: number) => {
            return (q): void => {
                // Filter by advertiser
                if (advertiserId != null) {
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID}`, advertiserId);
                }

                if (condoId != null) {
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                // Filters with records available.
                q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);

                // Join with Condo
                // q.innerJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME,
                //     `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                //     Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CONDO_ID);

                // Join with Advertising Template.
                q.innerJoin(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME,
                    `${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ID}`,
                    Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.TEMPLATE_ID);

                if (keyword != null) {
                    q.innerJoin(Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME, `${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID}`);
                    q.where(`${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME}`, "ILIKE", `%${keyword}%`);
                    q.orWhere(`${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_NAME}`, "ILIKE", `%${keyword}%`);
                }

                if (templateType != null) {
                    if (templateType === ADVERTISING_TEMPLATE_TYPE.SPONSOR_AD_TEMPLATE) { // Sponsor ad template.
                        q.where(`${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE}`, ADVERTISING_TEMPLATE_TYPE.SPONSOR_AD_TEMPLATE);
                    } else {
                        // Filters all premium and standard template  for useful contacts.
                        q.where(q1 => {
                            q1.where(`${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE}`, ADVERTISING_TEMPLATE_TYPE.PREMIUM_TEMPLATE);
                            q1.orWhere(`${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE}`, ADVERTISING_TEMPLATE_TYPE.STANDARD_TEMPLATE);
                        });
                    }
                }

                // Filter by category
                if (categoryId != null) {
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID}`, categoryId);
                }

                // Filter by sub-category
                if (subCategoryId != null) {
                    q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID}`, subCategoryId);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrderBy) {
                    if (templateType != null && templateType !== ADVERTISING_TEMPLATE_TYPE.SPONSOR_AD_TEMPLATE) {
                        // JOIN FOR ORDER
                        q.innerJoin(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME,
                            `${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`,
                            Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID);

                        q.innerJoin(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME,
                            `${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`,
                            Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID);

                        // Order by category. (Priority and name)
                        q.orderBy(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY}`, "ASC");
                        q.orderBy(`${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}`, "ASC");

                        // Order by sub-category. (Priority and name)
                        q.orderBy(`${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY}`, "ASC");
                        q.orderBy(`${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}`, "ASC");
                    }

                    q.orderBy(`${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE}`, "ASC");
                    q.orderBy(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.FREQUENCY}`, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<AdvertisingCondoModel>();

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

export default AdvertisingCondoRepository;
