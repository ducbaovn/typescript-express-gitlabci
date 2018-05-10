import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import { OnlineFormFeeDto } from "../data/sql/models";
import { ExceptionModel } from "./";
import { ErrorCode, HttpStatus } from "../libs";

export class OnlineFormFeeModel extends BaseModel {
    public price: number;
    public subCategoryId: string;

    public static fromRequest(data: any): OnlineFormFeeModel {
        let model: OnlineFormFeeModel = new OnlineFormFeeModel();

        if (data != null) {
            model.id = BaseModel.getString(data.id);
            model.isEnable = BaseModel.getBoolean(data.isEnable);
            model.price = BaseModel.getNumber(data.price);
            model.subCategoryId = BaseModel.getString(data.subCategoryId);
        }
        return model;
    }

    public static fromDto(dto: OnlineFormFeeDto, filters = []): OnlineFormFeeModel {
        let model: OnlineFormFeeModel = null;

        if (dto != null) {
            model = new OnlineFormFeeModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.price = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.PRICE));
            model.subCategoryId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID));

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: OnlineFormFeeModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.price != null) {
                dto[Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.PRICE] = model.price;
            }

            if (model.subCategoryId != null) {
                dto[Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID] = model.subCategoryId;
            }
        }

        return dto;
    }
}


export default OnlineFormFeeModel;