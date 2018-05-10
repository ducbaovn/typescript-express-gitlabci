/**
 * Created by ducbaovn on 04/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel, CondoModel, BlockModel, UnitModel, ExceptionModel } from "./";
import { FunctionPasswordDto, CondoDto, BlockDto, UnitDto } from "../data/sql/models";
import { ErrorCode, HttpStatus, Utils } from "../libs";

export class FunctionPasswordModel extends BaseModel {
    public condoId: string;
    public newUser: string;
    public deposit: string;
    public onlineForm: string;
    public booking: string;
    public unitLog: string;
    public feedback: string;

    public static fromDto(dto: FunctionPasswordDto, filters: string[] = []): FunctionPasswordModel {
        let model: FunctionPasswordModel = null;
        if (dto != null) {
            model = new FunctionPasswordModel();
            model.id = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.condoId = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.newUser = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.NEW_USER));
            model.deposit = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.DEPOSIT));
            model.onlineForm = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ONLINE_FORM));
            model.booking = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.BOOKING));
            model.unitLog = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UNIT_LOG));
            model.feedback = BaseModel.getString(dto.get(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.FEEDBACK));
        }
        FunctionPasswordModel.filter(model, filters);

        return model;
    }

    public static toDto(model: FunctionPasswordModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.condoId != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.newUser != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.NEW_USER] = model.newUser;
        }
        if (model.deposit != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.DEPOSIT] = model.deposit;
        }
        if (model.onlineForm != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ONLINE_FORM] = model.onlineForm;
        }
        if (model.booking != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.BOOKING] = model.booking;
        }
        if (model.unitLog != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UNIT_LOG] = model.unitLog;
        }
        if (model.feedback != null) {
            dto[Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.FEEDBACK] = model.feedback;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): FunctionPasswordModel {
        let ret = new FunctionPasswordModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.condoId = this.getString(req.body.condoId);
            ret.newUser = Utils.hashPassword(req.body.newUser);
            ret.deposit = Utils.hashPassword(req.body.deposit);
            ret.onlineForm = Utils.hashPassword(req.body.onlineForm);
            ret.booking = Utils.hashPassword(req.body.booking);
            ret.unitLog = Utils.hashPassword(req.body.unitLog);
            ret.feedback = Utils.hashPassword(req.body.feedback);
        }
        if (!ret.condoId) {
            throw new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            );
        }

        return ret;
    }
}

export default FunctionPasswordModel;
