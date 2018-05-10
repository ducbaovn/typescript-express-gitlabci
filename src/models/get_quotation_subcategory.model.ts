/**
 * Created by ducbaovn on 04/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { GetQuotationServiceModel } from "./get_quotation_service.model";
import { GetQuotationSubcategoryDto } from "../data/sql/models";

export class GetQuotationSubcategoryModel extends BaseModel {
    public type: string;
    public status: string;
    public startDate: momentTz.Moment;
    public endDate: momentTz.Moment;
    public name: string;

    public services: GetQuotationServiceModel[];

    public static fromDto(dto: GetQuotationSubcategoryDto, filters: string[] = []): GetQuotationSubcategoryModel {
        let model: GetQuotationSubcategoryModel = null;
        if (dto != null) {
            model = new GetQuotationSubcategoryModel();
            model.id = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.name = BaseModel.getString(dto.get(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME));
        }

        let servicesRelation: any = dto.related("services");
        if (servicesRelation != null && servicesRelation.models != null && servicesRelation.models.length > 0) {
            model.services = [];
            servicesRelation.models.forEach(service => {
                model.services.push(GetQuotationServiceModel.fromDto(service, filters));
            });
        }

        let notExpiredServicesRelation: any = dto.related("notExpiredServices");
        if (notExpiredServicesRelation != null && notExpiredServicesRelation.models != null && notExpiredServicesRelation.models.length > 0) {
            model.services = [];
            notExpiredServicesRelation.models.forEach(service => {
                model.services.push(GetQuotationServiceModel.fromDto(service, filters));
            });
        }

        GetQuotationSubcategoryModel.filter(model, filters);

        return model;
    }

    public static toDto(model: GetQuotationSubcategoryModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.name != null) {
            dto[Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): GetQuotationSubcategoryModel {
        let ret = new GetQuotationSubcategoryModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.name = this.getString(req.body.name);
        }
        return ret;
    }
}

export default GetQuotationSubcategoryModel;
