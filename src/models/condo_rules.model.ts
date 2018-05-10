/**
 * Created by davidho on 2/18/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {BaseModel} from "./base.model";
import {CondoRulesDto} from "../data/sql/models";

export class CondoRulesModel extends BaseModel {

    public title: string;
    public document: string;
    public datePost: momentTz.Moment;
    public condoId: string;

    public static fromDto(dto: CondoRulesDto, filters: string[] = []): CondoRulesModel {
        let model: CondoRulesModel = null;
        if (dto != null) {
            model = new CondoRulesModel();
            model.id = BaseModel.getString(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.title = BaseModel.getString(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.TITLE));
            model.document = BaseModel.getString(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.DOCUMENT));
            model.condoId = BaseModel.getString(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.datePost = BaseModel.getDate(dto.get(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.DATE_POST));
        }
        CondoRulesModel.filter(model, filters);
        return model;
    }

    public static toDto(model: CondoRulesModel): any {
        let dto = {};
        if (model.isDeleted != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.isEnable != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.id != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.title != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.TITLE] = model.title;
        }
        if (model.document != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.DOCUMENT] = model.document;
        }
        if (model.condoId != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.datePost != null) {
            dto[Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.DATE_POST] = model.datePost;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): CondoRulesModel {
        let ret = new CondoRulesModel();
        if (req != null && req.body != null) {
            ret.title = this.getString(req.body.title);
            ret.document = this.getString(req.body.document);
            ret.condoId = this.getString(req.body.condoId);
            ret.datePost = this.getDate(req.body.datePost);
        }
        return ret;
    }
}

export default CondoRulesModel;
