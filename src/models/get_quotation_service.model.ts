/**
 * Created by ducbaovn on 04/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel} from "./base.model";
import { GetQuotationServiceDto, AdvertiserDto, GetQuotationSubcategoryDto } from "../data/sql/models";
import {AdvertiserModel} from "./advertiser.model";
import {GetQuotationSubcategoryModel} from "./get_quotation_subcategory.model";

export class GetQuotationServiceModel extends BaseModel {
    public type: string;
    public status: string;
    public startDate: momentTz.Moment;
    public endDate: momentTz.Moment;
    public advertiserId: string;
    public subcategoryId: string;
    public phoneNumber: string;
    public mobile: string;
    public email: string;
    public expiryDate: momentTz.Moment;

    public smsCount: number;
    public emailCount: number;
    public businessName: string;
    public subcategoryName: string;

    public static fromDto(dto: GetQuotationServiceDto, filters: string[] = []): GetQuotationServiceModel {
        let model: GetQuotationServiceModel = null;
        if (dto != null) {
            model = new GetQuotationServiceModel();
            model.id = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.advertiserId = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID));
            model.subcategoryId = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID));
            model.phoneNumber = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.PHONE_NUMBER));
            model.mobile = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.MOBILE));
            model.email = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EMAIL));
            model.expiryDate = BaseModel.getDate(dto.get(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EXPIRY_DATE));
        }

        let advertiserRelation: AdvertiserDto = dto.related("advertiser") as AdvertiserDto;
        if (advertiserRelation != null && advertiserRelation.id != null) {
            let advertiser = AdvertiserModel.fromDto(advertiserRelation, filters);
            if (advertiser != null) {
                model.businessName = advertiser.businessName;
            }
        }

        let subcategoryRelation: GetQuotationSubcategoryDto = dto.related("subcategory") as GetQuotationSubcategoryDto;
        if (subcategoryRelation != null && subcategoryRelation.id != null) {
            let subcategory = GetQuotationSubcategoryModel.fromDto(subcategoryRelation, filters);
            if (subcategory != null) {
                model.subcategoryName = subcategory.name;
            }
        }

        let smsCountRelations: any = dto.related("smsCount");
        model.smsCount = 0;
        if (smsCountRelations != null && smsCountRelations.models != null && smsCountRelations.models.length > 0) {
            model.smsCount = smsCountRelations.models.length;
        }

        let emailCountRelations: any = dto.related("emailCount");
        model.emailCount = 0;
        if (emailCountRelations != null && emailCountRelations.models != null && emailCountRelations.models.length > 0) {
            model.emailCount = emailCountRelations.models.length;
        }

        GetQuotationServiceModel.filter(model, filters);

        return model;
    }

    public static toDto(model: GetQuotationServiceModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.advertiserId != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID] = model.advertiserId;
        }
        if (model.subcategoryId != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID] = model.subcategoryId;
        }
        if (model.phoneNumber != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.PHONE_NUMBER] = model.phoneNumber;
        }
        if (model.mobile != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.MOBILE] = model.mobile;
        }
        if (model.email != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }
        if (model.expiryDate != null) {
            dto[Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EXPIRY_DATE] = model.expiryDate;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): GetQuotationServiceModel {
        let ret = new GetQuotationServiceModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.advertiserId = this.getString(req.body.advertiserId);
            ret.subcategoryId = this.getString(req.body.subcategoryId);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.mobile = this.getString(req.body.mobile);
            ret.email = this.getString(req.body.email);
            ret.expiryDate = this.getDate(req.body.expiryDate);
        }
        return ret;
    }
}

export default GetQuotationServiceModel;
