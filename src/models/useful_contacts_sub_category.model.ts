/**
 * Created by thanhphan on 4/5/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {AdvertisingCondoModel} from "./advertising_condo.model";
import {AdvertisingTemplateModel} from "./advertising_template.model";
import {BaseModel} from "./base.model";
import {UsefulContactsCategoryModel} from "./useful_contacts_category.model";
import {UsefulContactsSubCategoryDto} from "../data/sql/models";
import {UsefulSubCategoryTemplateModel} from "./useful_sub_category_template.model";

export class UsefulContactsSubCategoryModel extends BaseModel {
    public id: string;
    public categoryId: string;
    public name: string;
    public iconUrl?: string;
    public desc?: string;
    public priority: number;
    public category: UsefulContactsCategoryModel;
    public templates: AdvertisingTemplateModel[];

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {UsefulContactsSubCategoryModel}
     */
    public static fromRequest(req: express.Request): UsefulContactsSubCategoryModel {
        let ret = new UsefulContactsSubCategoryModel();

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
    public static fromDto(dto: UsefulContactsSubCategoryDto, filters = []): UsefulContactsSubCategoryModel {
        let model: UsefulContactsSubCategoryModel = null;

        if (dto != null) {
            model = new UsefulContactsSubCategoryModel();

            model.id = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.categoryId = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID));
            model.name = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.iconUrl = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ICON_URL));
            model.desc = BaseModel.getString(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.priority = BaseModel.getNumber(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY));
            // model.isEnable = BaseModel.getBoolean(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            // model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));

            // Mapping with category model.
            let categoryRelation: any = dto.related("category");
            if (categoryRelation != null && categoryRelation.id != null) {
                model.category = UsefulContactsCategoryModel.fromDto(categoryRelation, filters);
            }
            if (filters != null && filters.length > 0) {
                UsefulContactsSubCategoryModel.filter(model, filters);
            }

            let advertisingCondosRelation: any = dto.related("advertisingCondos");
            if (advertisingCondosRelation != null && advertisingCondosRelation.models.length > 0) {
                model.templates = [];
                advertisingCondosRelation.models.forEach(template => {
                    model.templates.push(AdvertisingCondoModel.fromDto(template).advertisingTemplate);
                });
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: UsefulContactsSubCategoryModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.categoryId != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID] = model.categoryId;
        }

        if (model.name != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.iconUrl != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ICON_URL] = model.iconUrl;
        }

        if (model.desc != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.priority != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
        }

        if (model.isEnable != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        return dto;
    }

    /**
     * Make useful contact sub-category model.
     *
     * @param categoryId
     * @param templateModel
     * @returns {UsefulContactsSubCategoryModel}
     */
    public static makeModelFromTemplate(categoryId: string, templateModel: UsefulSubCategoryTemplateModel): UsefulContactsSubCategoryModel {
        let model = new UsefulContactsSubCategoryModel();

        model.categoryId = categoryId;
        model.name = templateModel.name;
        model.iconUrl = templateModel.iconUrl;
        model.desc = templateModel.desc;
        model.priority = templateModel.priority;
        model.isEnable = true;
        model.isDeleted = false;

        return model;
    }
}

export default UsefulContactsSubCategoryModel;
