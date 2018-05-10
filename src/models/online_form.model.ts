/**
 * Created by davidho on 2/9/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {CondoModel} from "./condo.model";
import {OnlineFormDto, CondoDto} from "../data/sql/models";

export class OnlineFormModel extends BaseModel {
    public condoId: string;
    public name: string;
    public price: number;
    public countOfRequest: number;
    public tcURL: string;
    // it is keyword
    public categoryId: string;
    public priority: number;

    public condo: CondoModel;


    public static fromDto(dto: OnlineFormDto, filters: string[] = []): OnlineFormModel {
        let model: OnlineFormModel = null;
        if (dto != null) {
            model = new OnlineFormModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.condoId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.NAME));
            model.price = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRICE));
            model.countOfRequest = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.COUNT_OF_REQUEST));
            model.tcURL = BaseModel.getString(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.TC_URL));
            model.categoryId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID));
            model.priority = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRIORITY));

            let condoDto: CondoDto = dto.related("condo") as CondoDto;
            if (condoDto != null && condoDto.id != null) {
                let condoModel = CondoModel.fromDto(condoDto, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }
        }
        OnlineFormModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.name != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }
        if (model.price != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRICE] = model.price;
        }
        if (model.condoId != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.categoryId != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID] = model.categoryId;
        }
        if (model.countOfRequest != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.COUNT_OF_REQUEST] = model.countOfRequest;
        }
        if (model.tcURL != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.TC_URL] = model.tcURL;
        }
        if (model.priority != null) {
            dto[Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): OnlineFormModel {
        let ret = new OnlineFormModel();
        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.name = this.getString(req.body.name);
            ret.price = this.getNumber(req.body.price);
            ret.countOfRequest = this.getNumber(req.body.countOfRequest);
            ret.tcURL = this.getString(req.body.tcURL);
            ret.categoryId = this.getString(req.body.categoryId);
            ret.priority = this.getNumber(req.body.priority);
        }
        return ret;
    }
}

export default OnlineFormModel;
