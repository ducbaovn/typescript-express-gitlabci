/**
 * Created by ducbaovn on 08/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel, UserModel, CondoModel, UserManagerModel, GetQuotationServiceModel } from "./";
import { UserManagerDto, GetQuotationServiceDto } from "../data/sql/models";

export class SmsModel extends BaseModel {
    public type: string;
    public to: string;
    public userManagerId: string;
    public getQuotationId: string;
    public smsId: string;

    public userManager: UserManagerModel;
    public getQuotation: GetQuotationServiceModel;
    public user: UserModel;
    public condo: CondoModel;

    // for get-quotation report
    public subcategoryName: string;
    public createdDay: momentTz.Moment;

    public static fromDto(dto: UserManagerDto, filters: string[] = []): SmsModel {
        let model: SmsModel = null;
        if (dto != null) {
            model = new SmsModel();
            model.id = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.type = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE));
            model.to = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.TO));
            model.userManagerId = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID));
            model.getQuotationId = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID));
            model.smsId = BaseModel.getString(dto.get(Schema.SMS_TABLE_SCHEMA.FIELDS.SMS_ID));
            // for get quotation report
            model.subcategoryName = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.createdDay = BaseModel.getDate(dto.get("created_day"));

            let userManagerRelation: UserManagerDto = dto.related("userManager") as UserManagerDto;
            if (userManagerRelation != null && userManagerRelation.id != null) {
                let userManager = UserManagerModel.fromDto(userManagerRelation, filters);
                model.userManager = userManager;
            }

            let getQuotationRelation: GetQuotationServiceDto = dto.related("getQuotation") as GetQuotationServiceDto;
            if (getQuotationRelation != null && getQuotationRelation.id != null) {
                let getQuotation = GetQuotationServiceModel.fromDto(getQuotationRelation, filters);
                model.getQuotation = getQuotation;
            }
        }
        SmsModel.filter(model, filters);

        return model;
    }

    public static toDto(model: SmsModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.type != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.to != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.TO] = model.to;
        }
        if (model.userManagerId != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID] = model.userManagerId;
        }
        if (model.getQuotationId != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID] = model.getQuotationId;
        }
        if (model.smsId != null) {
            dto[Schema.SMS_TABLE_SCHEMA.FIELDS.SMS_ID] = model.smsId;
        }

        return dto;
    }
}

export default SmsModel;
