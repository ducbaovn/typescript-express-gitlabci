/**
 * Created by thanhphan on 4/5/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {CondoModel} from "./condo.model";
import {UsefulCategoryTemplateModel} from "./useful_category_template.model";
import {UsefulContactsCategoryDto} from "../data/sql/models";
import {UsefulContactsSubCategoryModel} from "./useful_contacts_sub_category.model";

export class UsefulContactsCategoryModel extends BaseModel {
    public id: string;
    public keyword: string;
    public condoId: string;
    public name: string;
    public iconUrl?: string;
    public desc?: string;
    public priority: number;
    public condo: CondoModel;
    public subCategories: UsefulContactsSubCategoryModel[];

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {UsefulContactsCategoryModel}
     */
    public static fromRequest(req: express.Request): UsefulContactsCategoryModel {
        let ret = new UsefulContactsCategoryModel();

        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.keyword = this.getString(req.body.keyword);
            ret.name = this.getString(req.body.name);
            ret.iconUrl = this.getString(req.body.iconUrl);
            ret.desc = this.getString(req.body.desc);
            ret.priority = this.getNumber(req.body.priority);
            ret.isEnable = this.getBoolean(req.body.isEnable);
            ret.isDeleted = this.getBoolean(req.body.isDeleted, false);
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {UsefulContactsSubCategoryModel}
     */
    public static fromDto(dto: UsefulContactsCategoryDto, filters = []): UsefulContactsCategoryModel {
        let model: UsefulContactsCategoryModel = null;

        if (dto != null) {
            model = new UsefulContactsCategoryModel();

            model.id = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.keyword = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD));
            model.condoId = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.iconUrl = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ICON_URL));
            model.desc = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.priority = BaseModel.getNumber(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY));
            // model.isEnable = BaseModel.getBoolean(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            // model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));

            // Mapping with condo model.
            let condoRelations: any = dto.related("condo");

            if (condoRelations != null && condoRelations.id != null) {
                model.condo = CondoModel.fromDto(condoRelations, filters);
            }

            // Mapping list sub-categories.
            let subCategoriesRelations: any = dto.related("subCategories");

            if (subCategoriesRelations != null && subCategoriesRelations.models != null && subCategoriesRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesRelations.models.forEach(item => {
                    model.subCategories.push(UsefulContactsSubCategoryModel.fromDto(item, filters));
                });
            }
            // Mapping list not empty sub-categories.
            let subCategoriesNotEmptyRelations: any = dto.related("subCategoriesNotEmpty");

            if (subCategoriesNotEmptyRelations != null && subCategoriesNotEmptyRelations.models != null && subCategoriesNotEmptyRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesNotEmptyRelations.models.forEach(item => {
                    model.subCategories.push(UsefulContactsSubCategoryModel.fromDto(item, filters));
                });
            }
            // Only for system admin.
            let subCategoriesNotFilterRelations: any = dto.related("subCategoriesNotFilter");

            if (subCategoriesNotFilterRelations != null && subCategoriesNotFilterRelations.models != null && subCategoriesNotFilterRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesNotFilterRelations.models.forEach(item => {
                    model.subCategories.push(UsefulContactsSubCategoryModel.fromDto(item, filters));
                });
            }

            if (filters != null && filters.length > 0) {
                UsefulContactsCategoryModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: UsefulContactsCategoryModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.keyword != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD] = model.keyword;
        }

        if (model.condoId != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.name != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.iconUrl != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ICON_URL] = model.iconUrl;
        }

        if (model.desc != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.priority != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
        }

        if (model.isEnable != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        return dto;
    }

    /**
     * Make useful contact model.
     *
     * @param condoId
     * @param templateModel
     * @returns {UsefulContactsCategoryModel}
     */
    public static makeModelFromTemplate(condoId: string, templateModel: UsefulCategoryTemplateModel): UsefulContactsCategoryModel {
        let model = new UsefulContactsCategoryModel();

        model.keyword = templateModel.id;
        model.condoId = condoId;
        model.name = templateModel.name;
        model.iconUrl = templateModel.iconUrl;
        model.desc = templateModel.desc;
        model.priority = templateModel.priority;
        model.isEnable = true;
        model.isDeleted = false;

        return model;
    }
}

export default UsefulContactsCategoryModel;
