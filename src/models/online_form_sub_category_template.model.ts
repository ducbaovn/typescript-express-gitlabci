/**
 * Created by davidho on 3/1/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {OnlineFormSubCategoryTemplateDto, OnlineFormCategoryTemplateDto} from "../data/sql/models";
import {OnlineFormCategoryTemplateModel} from "./online_form_category_template.model";

export class OnlineFormSubCategoryTemplateModel extends BaseModel {

    public name: string;
    public subTemplateId: string;
    public category: OnlineFormCategoryTemplateModel;

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {OnlineFormSubCategoryTemplateModel}
     */
    public static fromRequest(req: express.Request): OnlineFormSubCategoryTemplateModel {
        let ret = new OnlineFormSubCategoryTemplateModel();

        if (req != null && req.body != null) {
            ret.name = this.getString(req.body.name);
            ret.isEnable = this.getBoolean(req.body.isEnable);
            ret.isDeleted = this.getBoolean(req.body.isDeleted);
            ret.subTemplateId = this.getString(req.body.subTemplateId);
        }

        return ret;
    }

    public static fromDto(dto: OnlineFormSubCategoryTemplateDto, filters: string[] = []): OnlineFormSubCategoryTemplateModel {
        let model: OnlineFormSubCategoryTemplateModel = null;
        if (dto != null) {
            model = new OnlineFormSubCategoryTemplateModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            // Mapping with category model.
            let categoryRelation: any = dto.related("category");
            if (categoryRelation != null && categoryRelation.id != null) {
                model.category = OnlineFormCategoryTemplateModel.fromDto(categoryRelation, filters);
            }
        }
        OnlineFormSubCategoryTemplateModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormSubCategoryTemplateModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.name != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.subTemplateId != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = model.subTemplateId;
        }
        return dto;
    }
}

export default OnlineFormSubCategoryTemplateModel;
