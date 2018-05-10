/**
 * Created by thanhphan on 4/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { AdvertiserModel } from "./advertiser.model";
import { AdvertisingImageModel } from "./advertising_image.model";
import { AdvertisingTemplateDto } from "../data/sql/models";
import { BaseModel } from "./base.model";
import { UsefulContactsSubCategoryModel } from "./useful_contacts_sub_category.model";
import { RATING_ADVERTISING_TEMPLATE_SCHEMA } from "../data/sql/schema";
import * as _ from "lodash";
import { RATING_TEMPLATE } from "../libs/constants";

export class AdvertisingTemplateModel extends BaseModel {
    public advertiserId: string;
    public templateName: string;
    public profileName: string;
    public profilePictureUrl: string;
    public heading: string;
    public shortDesc: string;
    public sms: string;
    public phone: string;
    public headingMainPage: string;
    public desc: string;
    public smsMainPage: string;
    public phoneMainPage: string;
    public website: string;
    public addressLine1: string;
    public addressLine2: string;
    public postalCode: string;
    public openingHour: string;
    public openingHourExt: string;
    public openingHourNote: string;
    public templateType: string;                // Premium, Standard or Sponsor Ad template.
    public isSmsEnable: boolean;
    public isPhoneEnable: boolean;
    public isSmsMainPageEnable: boolean;
    public isPhoneMainPageEnable: boolean;
    public isWebsiteEnable: boolean;
    public isLocationEnable: boolean;

    public advertiser?: AdvertiserModel;        // Related with Advertiser info.
    public pictures: AdvertisingImageModel[];   // Contains list picture inside the template.
    public subCategory: UsefulContactsSubCategoryModel;
    public isRating: boolean;
    public ratingValue: number = 5.0;
    public myRatingValue: number;

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {AdvertisingTemplateModel}
     */
    public static fromRequest(req: express.Request): AdvertisingTemplateModel {
        let ret = new AdvertisingTemplateModel();

        if (req != null && req.body != null) {
            ret.advertiserId = this.getString(req.body.advertiserId, null);
            ret.templateName = this.getString(req.body.templateName);
            ret.profileName = this.getString(req.body.profileName);
            ret.profilePictureUrl = this.getString(req.body.profilePictureUrl);
            ret.heading = this.getString(req.body.heading);
            ret.shortDesc = this.getString(req.body.shortDesc);
            ret.sms = this.getString(req.body.sms);
            ret.phone = this.getString(req.body.phone);
            ret.headingMainPage = this.getString(req.body.headingMainPage);
            ret.desc = this.getString(req.body.desc);
            ret.smsMainPage = this.getString(req.body.smsMainPage);
            ret.phoneMainPage = this.getString(req.body.phoneMainPage);
            ret.website = this.getString(req.body.website);
            ret.addressLine1 = this.getString(req.body.addressLine1);
            ret.addressLine2 = this.getString(req.body.addressLine2);
            ret.postalCode = this.getString(req.body.postalCode);
            ret.openingHour = this.getString(req.body.openingHour);
            ret.openingHourExt = this.getString(req.body.openingHourExt);
            ret.openingHourNote = this.getString(req.body.openingHourNote);
            ret.templateType = this.getString(req.body.templateType);
            ret.isSmsEnable = this.getBoolean(req.body.isSmsEnable);
            ret.isPhoneEnable = this.getBoolean(req.body.isPhoneEnable);
            ret.isSmsMainPageEnable = this.getBoolean(req.body.isSmsMainPageEnable);
            ret.isPhoneMainPageEnable = this.getBoolean(req.body.isPhoneMainPageEnable);
            ret.isWebsiteEnable = this.getBoolean(req.body.isWebsiteEnable);
            ret.isLocationEnable = this.getBoolean(req.body.isLocationEnable);

            if (req.body.pictures != null && req.body.pictures.length > 0) {
                ret.pictures = [];

                req.body.pictures.forEach(item => {
                    ret.pictures.push(AdvertisingImageModel.makeModel(item));
                });
            }
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {AdvertisingTemplateModel}
     */
    public static fromDto(dto: AdvertisingTemplateDto, filters = []): AdvertisingTemplateModel {
        let model: AdvertisingTemplateModel = null;

        if (dto != null) {
            model = new AdvertisingTemplateModel();

            model.id = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.advertiserId = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID));
            model.templateName = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_NAME));
            model.profileName = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PROFILE_NAME));
            model.profilePictureUrl = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PROFILE_PICTURE_URL));
            model.heading = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING));
            model.shortDesc = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SHORT_DESCRIPTION));
            model.sms = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS));
            model.phone = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE));
            model.headingMainPage = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING_MAIN_PAGE));
            model.desc = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.smsMainPage = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS_MAIN_PAGE));
            model.phoneMainPage = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE_MAIN_PAGE));
            model.website = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.WEBSITE));
            model.addressLine1 = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1));
            model.addressLine2 = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2));
            model.postalCode = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.POSTAL_CODE));
            model.openingHour = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR));
            model.openingHourExt = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR_EXT));
            model.openingHourNote = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR_NOTE));
            model.templateType = BaseModel.getString(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE));
            model.isSmsEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_ENABLE));
            model.isPhoneEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE));
            model.isSmsMainPageEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_MAINPAGE_ENABLE));
            model.isPhoneMainPageEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_MAINPAGE_ENABLE));
            model.isWebsiteEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE));
            model.isLocationEnable = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_LOCATION_ENABLE));

            // Mapping with Advertiser info.
            let advertiserRelation: any = dto.related("advertiser");

            if (advertiserRelation != null && advertiserRelation.id != null) {
                model.advertiser = AdvertiserModel.fromDto(advertiserRelation, filters);
            }

            if (filters != null && filters.length > 0) {
                AdvertisingTemplateModel.filter(model, filters);
            }
            // Mapping with all pictures inside the template.
            let pictureRelations: any = dto.related("pictures");

            if (pictureRelations != null && pictureRelations.models != null && pictureRelations.models.length > 0) {
                model.pictures = [];

                pictureRelations.models.forEach(item => {
                    model.pictures.push(AdvertisingImageModel.fromDto(item, filters));
                });
            }

            let rating: any = dto.related("templateRatings");
            if (rating != null && rating.get("template_id")) {
                model.ratingValue = rating.get("avr_rating");
            }

            if (filters != null && filters.length > 0) {
                AdvertisingTemplateModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AdvertisingTemplateModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.advertiserId != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID] = model.advertiserId;
        }

        if (model.templateName != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_NAME] = model.templateName;
        }

        if (model.profileName != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PROFILE_NAME] = model.profileName;
        }

        if (model.profilePictureUrl != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PROFILE_PICTURE_URL] = model.profilePictureUrl;
        }

        if (model.heading != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING] = model.heading;
        }

        if (model.shortDesc != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SHORT_DESCRIPTION] = model.shortDesc;
        }

        if (model.sms != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS] = model.sms;
        }

        if (model.phone != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE] = model.phone;
        }

        if (model.headingMainPage != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.HEADING_MAIN_PAGE] = model.headingMainPage;
        }

        if (model.desc != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.smsMainPage != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.SMS_MAIN_PAGE] = model.smsMainPage;
        }

        if (model.phoneMainPage != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.PHONE_MAIN_PAGE] = model.phoneMainPage;
        }

        if (model.website != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.WEBSITE] = model.website;
        }

        if (model.addressLine1 != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1] = model.addressLine1;
        }

        if (model.addressLine2 != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2] = model.addressLine2;
        }

        if (model.postalCode != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.POSTAL_CODE] = model.postalCode;
        }

        if (model.openingHour != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR] = model.openingHour;
        }

        if (model.openingHourExt != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR_EXT] = model.openingHourExt;
        }

        if (model.openingHourNote != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.OPENING_HOUR_NOTE] = model.openingHourNote;
        }

        if (model.templateType != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.TEMPLATE_TYPE] = model.templateType;
        }

        if (model.isSmsEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_ENABLE] = model.isSmsEnable;
        }

        if (model.isPhoneEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE] = model.isPhoneEnable;
        }

        if (model.isSmsMainPageEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_MAINPAGE_ENABLE] = model.isSmsMainPageEnable;
        }

        if (model.isPhoneMainPageEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_MAINPAGE_ENABLE] = model.isPhoneMainPageEnable;
        }

        if (model.isWebsiteEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE] = model.isWebsiteEnable;
        }

        if (model.isLocationEnable != null) {
            dto[Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_LOCATION_ENABLE] = model.isLocationEnable;
        }

        return dto;
    }
}

export default AdvertisingTemplateModel;
