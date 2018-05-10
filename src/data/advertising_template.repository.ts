/**
 * Created by thanhphan on 4/12/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {BaseRepository} from "./base.repository";
import {AdvertisingTemplateDto} from "./sql/models";
import {CollectionWrap, AdvertisingTemplateModel} from "../models";

export class AdvertisingTemplateRepository extends BaseRepository<AdvertisingTemplateDto, AdvertisingTemplateModel> {
    constructor() {
        super(AdvertisingTemplateDto, AdvertisingTemplateModel, {
            fromDto: AdvertisingTemplateModel.fromDto,
            toDto: AdvertisingTemplateModel.toDto,
        });
    }

    /**
     * Get list advertising template for advertiser.
     *
     * @param queryParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<AdvertisingTemplateModel[]>}
     */
    public getAllAdvertisingTemplate(queryParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertisingTemplateModel>> {
        let advertiserId = queryParams.advertiserId || null;
        let templateType = queryParams.templateType || null;
        if (templateType != null) {
            templateType = templateType.split(",");
            templateType.forEach(type => {
                type = type.trim();
            });
        }
        let keySearch = queryParams.key || null;

        limit = limit || null;
        offset = offset || null;

        let query = (isOrderBy?: boolean, offset?: number, limit?: number) => {
            return (q): void => {
                // Filter by advertiser.
                if (advertiserId != null) {
                    q.where(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID, advertiserId);
                }

                // Filter by template type.
                if (templateType != null) {
                    q.whereIn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE, templateType);
                }

                // Support search by key.
                if (keySearch != null) {
                    q.where(q1 => {
                        q1.where(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_NAME, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PROFILE_NAME, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SHORT_DESCRIPTION, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING_MAIN_PAGE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS_MAIN_PAGE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE_MAIN_PAGE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.WEBSITE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.POSTAL_CODE, "ILIKE", `%${keySearch}%`);
                        q1.orWhere(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION, "ILIKE", `%${keySearch}%`);
                    });
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrderBy) {
                    q.orderBy(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_NAME, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<AdvertisingTemplateModel>();

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

export default AdvertisingTemplateRepository;
