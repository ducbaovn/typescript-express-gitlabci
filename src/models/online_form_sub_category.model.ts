import * as _ from "lodash";
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {CondoModel} from "./condo.model";
import {OnlineFormSubCategoryTemplateModel} from "./online_form_sub_category_template.model";
import {OnlineFormCategoryModel} from "./online_form_category.model";
import {OnlineFormFeeModel} from "./online_form_fee.model";
import {OnlineFormSubCategoryDto, OnlineFormCategoryDto, OnlineFormSubCategoryTemplateDto, OnlineFormFeeDto, CondoDto} from "../data/sql/models";
export class OnlineFormSubCategoryModel extends BaseModel {
    public name: string;
    public condoId: string;
    public condo: CondoModel;

    public categoryId: string;
    public category: OnlineFormCategoryModel;

    public subTemplateId: string;
    public subCategoryTemplate: OnlineFormSubCategoryTemplateModel;

    public price: number;

    public static fromDto(dto: OnlineFormSubCategoryDto, filters: string[] = []): OnlineFormSubCategoryModel {
        let model: OnlineFormSubCategoryModel = null;
        if (dto != null) {
            model = new OnlineFormSubCategoryModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.condoId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.price = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.PRICE));
            model.subTemplateId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID));
            model.categoryId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID));
        }

        // model.onlineFormCategoryId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID));
        let onlineFormCategoryRelation: OnlineFormCategoryDto = dto.related("onlineFormCategory") as OnlineFormCategoryDto;
        if (onlineFormCategoryRelation != null && onlineFormCategoryRelation.id != null) {
            let onlineFormCategoryModel = OnlineFormCategoryModel.fromDto(onlineFormCategoryRelation, filters);
            if (onlineFormCategoryModel != null) {
                model.category = onlineFormCategoryModel;
            }
        }

        // model.onlineFormSubCategoryTemplateId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID));
        let onlineFormSubCategoryTemplateRelation: OnlineFormSubCategoryTemplateDto = dto.related("onlineFormSubCategoryTemplate") as OnlineFormSubCategoryTemplateDto;
        if (onlineFormSubCategoryTemplateRelation != null && onlineFormSubCategoryTemplateRelation.id != null) {
            let onlineFormSubCategoryTemplateModel = OnlineFormSubCategoryTemplateModel.fromDto(onlineFormSubCategoryTemplateRelation, filters);
            if (onlineFormSubCategoryTemplateModel != null) {
                model.subCategoryTemplate = onlineFormSubCategoryTemplateModel;
            }
        }

        let condoDto: CondoDto = dto.related("condo") as CondoDto;
        if (condoDto != null && condoDto.id != null) {
            let condoModel = CondoModel.fromDto(condoDto, filters);
            if (condoModel != null) {
                model.condo = condoModel;
            }
        }

        let subFilters = _.uniqBy(
            [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
            (key) => {
                return key;
            }
        );


        let price: any = dto.related("price");
        if (price != null && price.id != null) {
            let feeDto: OnlineFormFeeDto = price as OnlineFormFeeDto;
            let feeModel = OnlineFormFeeModel.fromDto(feeDto, [...subFilters]);
            model.price = feeModel.price;
        }

        OnlineFormSubCategoryModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormSubCategoryModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.name != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }
        if (model.condoId != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.categoryId != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID] = model.categoryId;
        }
        if (model.subTemplateId != null) {
            dto[Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID] = model.subTemplateId;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): OnlineFormSubCategoryModel {
        let ret = new OnlineFormSubCategoryModel();
        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.name = this.getString(req.body.name);
            ret.price = this.getNumber(req.body.price);
            ret.categoryId = this.getString(req.body.categoryId);
            ret.subTemplateId = this.getString(req.body.subTemplateId);
        }
        return ret;
    }
}

export default OnlineFormSubCategoryModel;
