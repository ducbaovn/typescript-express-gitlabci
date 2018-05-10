/**
 * Created by davidho on 2/26/17.
 */
import * as _ from "lodash";
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import * as express from "express";
import {OnlineFormCategoryTemplateDto, OnlineFormSubCategoryTemplateDto} from "../data/sql/models";
import { OnlineFormSubCategoryTemplateModel} from "./online_form_sub_category_template.model";

export class OnlineFormCategoryTemplateModel extends BaseModel {
    public name: string;
    public keyword: string;
    public subCategories: any[];

    public static fromDto(dto: OnlineFormCategoryTemplateDto, filters: string[] = []): OnlineFormCategoryTemplateModel {
        let model: OnlineFormCategoryTemplateModel = null;
        if (dto != null) {
            model = new OnlineFormCategoryTemplateModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.name = BaseModel.getString(dto.get(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME));

            // Mapping list sub-categories.
            let subCategoriesRelations: any = dto.related("subCategories");
            if (subCategoriesRelations != null && subCategoriesRelations.models != null && subCategoriesRelations.models.length > 0) {
                model.subCategories = [];

                subCategoriesRelations.models.forEach(item => {
                    model.subCategories.push(OnlineFormSubCategoryTemplateModel.fromDto(item, filters));
                });
            }
        }

        OnlineFormCategoryTemplateModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormCategoryTemplateModel): any {
        let dto = {};
        return dto;
    }
}

export default OnlineFormCategoryTemplateModel;
