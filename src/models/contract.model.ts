/**
 * Created by ducbaovn on 04/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { ContractDto } from "../data/sql/models";
import { STATUS_CONTRACT, TIME_ZONE } from "../libs/constants";

export class ContractModel extends BaseModel {
    public condoId: string;
    public type: string;
    public status: string;
    public startDate: momentTz.Moment;
    public endDate: momentTz.Moment;
    public vendorName: string;
    public amount: number;
    public contractDocument: string;
    public tender1Document: string;
    public tender2Document: string;
    public tender3Document: string;
    public tender4Document: string;
    public tender5Document: string;
    public isNearlyExpired: boolean; // 3 months before end date

    public static fromDto(dto: ContractDto, filters: string[] = []): ContractModel {
        let model: ContractModel = null;
        if (dto != null) {
            model = new ContractModel();
            model.id = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.condoId = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.type = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TYPE));
            model.status = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.STATUS));
            model.startDate = BaseModel.getDate(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.START_DATE));
            model.endDate = BaseModel.getDate(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE));
            model.vendorName = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.VENDOR_NAME));
            model.amount = BaseModel.getNumber(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.AMOUNT));
            model.contractDocument = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONTRACT_DOCUMENT));
            model.tender1Document = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER1_DOCUMENT));
            model.tender2Document = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER2_DOCUMENT));
            model.tender3Document = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER3_DOCUMENT));
            model.tender4Document = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER4_DOCUMENT));
            model.tender5Document = BaseModel.getString(dto.get(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER5_DOCUMENT));
            model.isNearlyExpired = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_DEFAULT).add(3, "M") > model.endDate ? true : false;
        }
        ContractModel.filter(model, filters);

        return model;
    }

    public static toDto(model: ContractModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.condoId != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.type != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.status != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }
        if (model.startDate != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.START_DATE] = model.startDate;
        }
        if (model.endDate != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE] = model.endDate;
        }
        if (model.vendorName != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.VENDOR_NAME] = model.vendorName;
        }
        if (model.amount != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.AMOUNT] = model.amount;
        }
        if (model.contractDocument != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONTRACT_DOCUMENT] = model.contractDocument;
        }
        if (model.tender1Document != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER1_DOCUMENT] = model.tender1Document;
        }
        if (model.tender2Document != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER2_DOCUMENT] = model.tender2Document;
        }
        if (model.tender3Document != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER3_DOCUMENT] = model.tender3Document;
        }
        if (model.tender4Document != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER4_DOCUMENT] = model.tender4Document;
        }
        if (model.tender5Document != null) {
            dto[Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER5_DOCUMENT] = model.tender5Document;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): ContractModel {
        let ret = new ContractModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.condoId = this.getString(req.body.condoId);
            ret.type = this.getString(req.body.type);
            ret.startDate = this.getDate(req.body.startDate);
            ret.endDate = this.getDate(req.body.endDate);
            ret.vendorName = this.getString(req.body.vendorName);
            ret.amount = this.getNumber(req.body.amount);
            ret.contractDocument = this.getString(req.body.contractDocument);
            ret.tender1Document = this.getString(req.body.tender1Document);
            ret.tender2Document = this.getString(req.body.tender2Document);
            ret.tender3Document = this.getString(req.body.tender3Document);
            ret.tender4Document = this.getString(req.body.tender4Document);
            ret.tender5Document = this.getString(req.body.tender5Document);
        }
        return ret;
    }
}

export default ContractModel;
