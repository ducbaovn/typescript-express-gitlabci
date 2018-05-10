/**
 * Created by ducbaovn on 05/07/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { ApplicationDto } from "../data/sql/models";

export class ApplicationModel extends BaseModel {
    public platform: string;
    public version: number;
    public isLatest: boolean;
    public forceUpdate: boolean;

    public static fromDto(dto: ApplicationDto, filters: string[] = []): ApplicationModel {
        let model: ApplicationModel = null;
        if (dto != null) {
            model = new ApplicationModel();
            model.id = BaseModel.getString(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.platform = BaseModel.getString(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.PLATFORM));
            model.version = BaseModel.getNumber(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.VERSION));
            model.isLatest = BaseModel.getBoolean(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_LATEST));
            model.forceUpdate = BaseModel.getBoolean(dto.get(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.FORCE_UPDATE));
        }
        ApplicationModel.filter(model, filters);

        return model;
    }

    public static toDto(model: ApplicationModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.APPLICATION_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.platform != null) {
            dto[Schema.APPLICATION_TABLE_SCHEMA.FIELDS.PLATFORM] = model.platform;
        }
        if (model.version != null) {
            dto[Schema.APPLICATION_TABLE_SCHEMA.FIELDS.VERSION] = model.version;
        }
        if (model.isLatest != null) {
            dto[Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_LATEST] = model.isLatest;
        }
        if (model.forceUpdate != null) {
            dto[Schema.APPLICATION_TABLE_SCHEMA.FIELDS.FORCE_UPDATE] = model.forceUpdate;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): ApplicationModel {
        let ret = new ApplicationModel();
        if (req != null && req.body != null) {
            ret.platform = this.getString(req.body.platform);
            ret.version = this.getNumber(req.body.version);
            ret.isLatest = this.getBoolean(req.body.isLatest);
            ret.forceUpdate = this.getBoolean(req.body.forceUpdate);
        }
        return ret;
    }
}

export default ApplicationModel;
