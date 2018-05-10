/**
 * Created by thanhphan on 4/5/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {UsefulCategoryTemplateModel} from "./useful_category_template.model";
import {UsefulContactsCategoryDto} from "../data/sql/models";

export class UsefulSubCategoryTemplateModel extends BaseModel {
    public id: string;
    public categoryId: string;
    public name: string;
    public iconUrl?: string;
    public desc?: string;
    public priority: number;
    public category: UsefulCategoryTemplateModel;

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {UsefulSubCategoryTemplateModel}
     */
    public static fromRequest(req: express.Request): UsefulSubCategoryTemplateModel {
        let ret = new UsefulSubCategoryTemplateModel();

        if (req != null && req.body != null) {
            ret.categoryId = this.getString(req.body.categoryId);
            ret.name = this.getString(req.body.name);
            ret.iconUrl = this.getString(req.body.iconUrl);
            ret.desc = this.getString(req.body.desc);
            ret.priority = this.getNumber(req.body.priority);
            ret.isEnable = this.getBoolean(req.body.isEnable);
            ret.isDeleted = this.getBoolean(req.body.isDeleted);
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {UsefulContactsSubCategoryModel}
     */
    public static fromDto(dto: UsefulContactsCategoryDto, filters = []): UsefulSubCategoryTemplateModel {
        let model: UsefulSubCategoryTemplateModel = null;

        if (dto != null) {
            model = new UsefulSubCategoryTemplateModel();

            model.id = BaseModel.getString(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.categoryId = BaseModel.getString(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CATEGORY_ID));
            model.name = BaseModel.getString(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME));
            model.iconUrl = BaseModel.getString(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ICON_URL));
            model.desc = BaseModel.getString(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.priority = BaseModel.getNumber(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED));

            // Mapping with category model.
            let categoryRelation: any = dto.related("category");

            if (categoryRelation != null && categoryRelation.id != null) {
                model.category = UsefulCategoryTemplateModel.fromDto(categoryRelation, filters);
            }

            if (filters != null && filters.length > 0) {
                UsefulSubCategoryTemplateModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: UsefulSubCategoryTemplateModel): any {
        let dto = {};

        if (model.categoryId != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CATEGORY_ID] = model.categoryId;
        }

        if (model.name != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.iconUrl != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ICON_URL] = model.iconUrl;
        }

        if (model.desc != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.priority != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.priority;
        }

        if (model.isEnable != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        return dto;
    }
}

export default UsefulSubCategoryTemplateModel;
