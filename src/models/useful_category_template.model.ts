/**
 * Created by thanhphan on 4/5/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {UsefulContactsCategoryDto} from "../data/sql/models";
import {UsefulSubCategoryTemplateModel} from "./useful_sub_category_template.model";

export class UsefulCategoryTemplateModel extends BaseModel {
    public id: string;
    public name: string;
    public iconUrl?: string;
    public desc?: string;
    public priority: number;
    public subCategories: any[];

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {UsefulCategoryTemplateModel}
     */
    public static fromRequest(req: express.Request): UsefulCategoryTemplateModel {
        let ret = new UsefulCategoryTemplateModel();

        if (req != null && req.body != null) {
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
     * @returns {UsefulCategoryTemplateModel}
     */
    public static fromDto(dto: UsefulContactsCategoryDto, filters = []): UsefulCategoryTemplateModel {
        let model: UsefulCategoryTemplateModel = null;

        if (dto != null) {
            model = new UsefulCategoryTemplateModel();

            model.id = BaseModel.getString(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME));
            model.iconUrl = BaseModel.getString(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ICON_URL));
            model.desc = BaseModel.getString(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.priority = BaseModel.getNumber(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED));

            // Mapping list sub-categories.
            let subCategoriesRelations: any = dto.related("subCategories");
            console.log(subCategoriesRelations);
            if (subCategoriesRelations != null && subCategoriesRelations.models != null && subCategoriesRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesRelations.models.forEach(item => {
                    model.subCategories.push(UsefulSubCategoryTemplateModel.fromDto(item, filters));
                });
            }

            if (filters != null && filters.length > 0) {
                UsefulCategoryTemplateModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: UsefulCategoryTemplateModel): any {
        let dto = {};

        if (model.name != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.iconUrl != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ICON_URL] = model.iconUrl;
        }

        if (model.desc != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.priority != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.priority;
        }

        if (model.isEnable != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        return dto;
    }
}

export default UsefulCategoryTemplateModel;
