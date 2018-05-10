import * as express from "express";
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {FeedbackCategoryDto} from "../data/sql/models";

export class FeedbackCategoryModel extends BaseModel {
    public condoId: string;
    public name: string;
    public email: string;
    public orderIndex: number;

    public static fromDto(dto: FeedbackCategoryDto, filters: string[] = []): FeedbackCategoryModel {
        let model: FeedbackCategoryModel = null;
        if (dto != null) {
            model = new FeedbackCategoryModel();
            model.id = BaseModel.getString(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.condoId = BaseModel.getString(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.email = BaseModel.getString(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.EMAIL));
            model.orderIndex = BaseModel.getNumber(dto.get(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX));
        }
        FeedbackCategoryModel.filter(model, filters);
        return model;
    }

    public static fromRequest(req: express.Request): FeedbackCategoryModel {
        let ret = new FeedbackCategoryModel();
        if (req != null && req.body != null) {
            ret.id = this.getString(req.body.id);
            ret.condoId = this.getString(req.body.condoId);
            ret.name = this.getString(req.body.name);
            ret.email = this.getString(req.body.email);
            ret.orderIndex = this.getNumber(req.body.orderIndex);
        }
        return ret;
    }

    public static toDto(model: FeedbackCategoryModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.condoId != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.name != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.email != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }

        if (model.orderIndex != null) {
            dto[Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX] = model.orderIndex;
        }

        return dto;
    }
}

export default FeedbackCategoryModel;
