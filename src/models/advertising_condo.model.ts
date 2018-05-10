/**
 * Created by thanhphan on 4/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { AdvertisingTemplateModel, AdvertiserModel, CondoModel, UsefulContactsCategoryModel, UsefulContactsSubCategoryModel } from "./";
import BaseModel from "./base.model";

export class AdvertisingCondoModel extends BaseModel {
    public advertiserId: string;                            // Advertiser: -> We will use this field to check template inside the advertiser.
    public condoId: string;
    public categoryId: string;
    public subCategoryId: string;
    public templateId: string;
    public frequency: number;
    public expiryDate: momentTz.Moment;
    public isExpired: boolean;

    public advertiser: AdvertiserModel;
    public condo?: CondoModel;                              // Relation to Condo
    public category?: UsefulContactsCategoryModel;          // Relation to Useful Contacts Category.
    public subCategory?: UsefulContactsSubCategoryModel;    // Relation to Useful Contacts Sub-Category.
    public advertisingTemplate?: AdvertisingTemplateModel;  // Relation to Advertising Template model.

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {AdvertisingCondoModel}
     */
    public static fromRequest(req: express.Request): AdvertisingCondoModel {
        let ret = new AdvertisingCondoModel();

        if (req != null && req.body != null) {
            ret.advertiserId = this.getString(req.body.advertiserId);
            ret.condoId = this.getString(req.body.condoId);
            ret.categoryId = this.getString(req.body.categoryId);
            ret.subCategoryId = this.getString(req.body.subCategoryId);
            ret.templateId = this.getString(req.body.templateId);
            ret.frequency = this.getNumber(req.body.frequency);
            ret.expiryDate = this.getDate(req.body.expiryDate);
            ret.isExpired = this.getBoolean(req.body.isExpired);
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {AdvertisingCondoModel}
     */
    public static fromDto(dto: any, filters = []): AdvertisingCondoModel {
        let model: AdvertisingCondoModel = null;

        if (dto != null) {
            model = new AdvertisingCondoModel();

            model.id = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ID));
            // model.createdDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            // model.updatedDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.advertiserId = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.categoryId = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID));
            model.subCategoryId = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID));
            model.templateId = BaseModel.getString(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.TEMPLATE_ID));
            model.frequency = BaseModel.getNumber(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.FREQUENCY));
            model.expiryDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.EXPIRY_DATE));
            model.isExpired = BaseModel.getBoolean(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_EXPIRED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CREATED_DATE));

            // Mapping with Condo model..
            let condoRelation: any = dto.related("condo");

            if (condoRelation != null && condoRelation.id != null) {
                model.condo = CondoModel.fromDto(condoRelation, filters);
            }

            // Mapping with Useful Contacts Sub-Category model..
            let catRelation: any = dto.related("category");

            if (catRelation != null && catRelation.id != null) {
                model.category = UsefulContactsCategoryModel.fromDto(catRelation, filters);
            }

            // Mapping with Useful Contacts Sub-Category model..
            let subCatRelation: any = dto.related("subCategory");

            if (subCatRelation != null && subCatRelation.id != null) {
                model.subCategory = UsefulContactsSubCategoryModel.fromDto(subCatRelation, filters);
            }

            // Mapping with Advertising Template model.
            let templateRelation: any = dto.related("advertisingTemplate");

            if (templateRelation != null && templateRelation.id != null) {
                model.advertisingTemplate = AdvertisingTemplateModel.fromDto(templateRelation, filters);
            }

            // Mapping with Advertising Template model.
            let advertiserRelation: any = dto.related("advertiser");

            if (advertiserRelation != null && advertiserRelation.id != null) {
                model.advertiser = AdvertiserModel.fromDto(advertiserRelation, filters);
            }

            if (filters != null && filters.length > 0) {
                AdvertisingCondoModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AdvertisingCondoModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.advertiserId != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID] = model.advertiserId;
        }

        if (model.condoId != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.categoryId != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID] = model.categoryId;
        }

        if (model.subCategoryId != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID] = model.subCategoryId;
        }

        if (model.templateId != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.TEMPLATE_ID] = model.templateId;
        }

        if (model.frequency != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.FREQUENCY] = model.frequency;
        }

        if (model.expiryDate != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.EXPIRY_DATE] = model.expiryDate;
        }

        if (model.isExpired != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_EXPIRED] = model.isExpired;
        }

        if (model.isDeleted != null) {
            dto[Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        return dto;
    }
}

export default AdvertisingCondoModel;
