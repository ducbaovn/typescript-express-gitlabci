/**
 * Created by ducbaovn on 06/06/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./";
import { CondoNameDto } from "../data/sql/models";

export class CondoNameModel extends BaseModel {
    public name: string;

    public static fromDto(dto: CondoNameDto, filters: string[] = []): CondoNameModel {
        let model: CondoNameModel = null;
        if (dto != null) {
            model = new CondoNameModel();
            model.id = BaseModel.getString(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.name = BaseModel.getString(dto.get(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME));
        }
        CondoNameModel.filter(model, filters);

        return model;
    }

    public static toDto(model: CondoNameModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.name != null) {
            dto[Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        return dto;
    }

    public static fromCsvArray(data: any[]): CondoNameModel[] {
        let condoNames = [];
        for (let row of data) {
            let ret = new CondoNameModel();
            ret.name = this.getString(row[0]);
            condoNames.push(ret);
        }
        return condoNames;
    }
}

export default CondoNameModel;
