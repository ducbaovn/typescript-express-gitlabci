/**
 * Created by ducbaovn on 27/07/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel, ExceptionModel, UserModel, CondoModel, UserManagerModel, GetQuotationServiceModel } from "./";
import { UserManagerDto, GetQuotationServiceDto } from "../data/sql/models";
import { ErrorCode, HttpStatus } from "../libs";


export class EmailModel extends BaseModel {
    public type: string;
    public to: string;
    public userManagerId: string;
    public itemId: string;
    public partnerId: string;

    // Custom Email fields
    public subject: string;
    public content: string;

    public userManager: UserManagerModel;
    public getQuotation: GetQuotationServiceModel;
    public user: UserModel;
    public condo: CondoModel;

    // for get-quotation report
    public subcategoryName: string;
    public createdDay: momentTz.Moment;

    public static fromRequest(req: express.Request): EmailModel {
        let ret = new EmailModel();
        if (req != null && req.body != null) {
            ret.subject = this.getString(req.body.subject);
            ret.content = this.getString(req.body.content);
        }
        if (!ret.subject || !ret.content) {
            throw new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            );
        }
        return ret;
    }

    public static fromDto(dto: UserManagerDto, filters: string[] = []): EmailModel {
        let model: EmailModel = null;
        if (dto != null) {
            model = new EmailModel();
            model.id = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.type = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE));
            model.to = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.TO));
            model.userManagerId = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID));
            model.itemId = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID));
            model.partnerId = BaseModel.getString(dto.get(Schema.EMAIL_TABLE_SCHEMA.FIELDS.PARTNER_ID));
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
        EmailModel.filter(model, filters);

        return model;
    }

    public static toDto(model: EmailModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.type != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.to != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.TO] = model.to;
        }
        if (model.userManagerId != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID] = model.userManagerId;
        }
        if (model.itemId != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID] = model.itemId;
        }
        if (model.partnerId != null) {
            dto[Schema.EMAIL_TABLE_SCHEMA.FIELDS.PARTNER_ID] = model.partnerId;
        }

        return dto;
    }
}

export default EmailModel;
