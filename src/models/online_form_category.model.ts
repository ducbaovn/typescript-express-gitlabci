/**
 * Created by davidho on 2/26/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {CondoModel} from "./condo.model";
import {OnlineFormSubCategoryModel} from "./online_form_sub_category.model";
import {OnlineFormCategoryDto, CondoDto} from "../data/sql/models";

export class OnlineFormCategoryModel extends BaseModel {
    public name: string;
    public condoId: string;
    public tcURL: string;
    public condo: CondoModel;
    public categoryTemplateId: string;
    public subCategories: any[];

    public static fromDto(dto: OnlineFormCategoryDto, filters: string[] = []): OnlineFormCategoryModel {
        let model: OnlineFormCategoryModel = null;
        if (dto != null) {
            model = new OnlineFormCategoryModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.condoId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.tcURL = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.TC_URL));
            model.categoryTemplateId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID));

            let condoDto: CondoDto = dto.related("condo") as CondoDto;
            if (condoDto != null && condoDto.id != null) {
                let condoModel = CondoModel.fromDto(condoDto, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            // Mapping list sub-categories.
            let subCategoriesRelations: any = dto.related("subCategories");
            if (subCategoriesRelations != null && subCategoriesRelations.models != null && subCategoriesRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesRelations.models.forEach(item => {
                    model.subCategories.push(OnlineFormSubCategoryModel.fromDto(item, filters));
                });
            }
        }

        OnlineFormCategoryModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormCategoryModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.name != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }
        if (model.condoId != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.tcURL != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.TC_URL] = model.tcURL;
        }
        if (model.categoryTemplateId != null) {
            dto[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = model.categoryTemplateId;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): OnlineFormCategoryModel {
        let ret = new OnlineFormCategoryModel();
        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.name = this.getString(req.body.name);
            ret.tcURL = this.getString(req.body.tcURL);
            ret.categoryTemplateId = this.getString(req.body.categoryTemplateId);
        }
        return ret;
    }
}

export default OnlineFormCategoryModel;
