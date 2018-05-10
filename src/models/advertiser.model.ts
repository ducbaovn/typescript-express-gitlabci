/**
 * Created by thanhphan on 4/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {AdvertiserDto} from "../data/sql/models";
import {BaseModel} from "./base.model";

export class AdvertiserModel extends BaseModel {
    public businessName: string;
    public contactName: string;
    public phoneNumber: string;
    public mobileNumber: string;
    public email: string;
    public website: string;
    public addressLine1: string;
    public addressLine2: string;
    public postalCode: string;
    public desc: string;

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {AdvertiserModel}
     */
    public static fromRequest(req: express.Request): AdvertiserModel {
        let ret = new AdvertiserModel();

        if (req != null && req.body != null) {
            ret.businessName = this.getString(req.body.businessName);
            ret.contactName = this.getString(req.body.contactName);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.mobileNumber = this.getString(req.body.mobileNumber);
            ret.email = this.getString(req.body.email);
            ret.website = this.getString(req.body.website);
            ret.addressLine1 = this.getString(req.body.addressLine1);
            ret.addressLine2 = this.getString(req.body.addressLine2);
            ret.postalCode = this.getString(req.body.postalCode);
            ret.desc = this.getString(req.body.desc);
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {AdvertiserModel}
     */
    public static fromDto(dto: AdvertiserDto, filters = []): AdvertiserModel {
        let model: AdvertiserModel = null;

        if (dto != null) {
            model = new AdvertiserModel();

            model.id = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID));
            // model.createdDate = BaseModel.getDate(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            // model.updatedDate = BaseModel.getDate(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.businessName = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME));
            model.contactName = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.CONTACT_NAME));
            model.phoneNumber = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER));
            model.mobileNumber = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.MOBILE_NUMBER));
            model.email = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.EMAIL));
            model.website = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.WEBSITE));
            model.addressLine1 = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1));
            model.addressLine2 = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2));
            model.postalCode = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.POSTAL_CODE));
            model.desc = BaseModel.getString(dto.get(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.DESCRIPTION));

            if (filters != null && filters.length > 0) {
                AdvertiserModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AdvertiserModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.businessName != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.BUSINESS_NAME] = model.businessName;
        }

        if (model.contactName != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.CONTACT_NAME] = model.contactName;
        }

        if (model.phoneNumber != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER] = model.phoneNumber;
        }

        if (model.mobileNumber != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.MOBILE_NUMBER] = model.mobileNumber;
        }

        if (model.email != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }

        if (model.website != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.WEBSITE] = model.website;
        }

        if (model.addressLine1 != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_1] = model.addressLine1;
        }

        if (model.addressLine2 != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ADDRESS_LINE_2] = model.addressLine2;
        }

        if (model.postalCode != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.POSTAL_CODE] = model.postalCode;
        }

        if (model.desc != null) {
            dto[Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        return dto;
    }
}

export default AdvertiserModel;
