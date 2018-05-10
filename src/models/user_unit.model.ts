/**
 * Created by davidho on 1/22/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel, UnitModel, UserModel, CondoModel } from "./";
import { UserUnitDto, UserDto, UnitDto, CondoDto } from "../data/sql/models";
import { STATUS_REQUEST_USER } from "../libs/constants";

export class UserUnitModel extends BaseModel {
    public userId: string;
    public unitId: string;
    public condoId: string;
    public roleId: string;
    public proofUrls: string[];
    public remarks: string;
    public isMaster: boolean;
    public isResident: boolean;
    public status: string;
    public tenancyExpiry: momentTz.Moment;

    public archivedDate: momentTz.Moment;
    public user: UserModel;
    public unit: UnitModel;
    public condo: CondoModel;

    public static fromDto(dto: UserUnitDto, filters: string[] = []): UserUnitModel {
        let model: UserUnitModel = null;
        if (dto != null) {
            model = new UserUnitModel();
            model.id = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID));
            model.unitId = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.roleId = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID));

            model.proofUrls = BaseModel.getArrayString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.PROOF_URL));
            model.remarks = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.REMARKS));

            model.isMaster = BaseModel.getBoolean(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_MASTER));
            model.isResident = BaseModel.getBoolean(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT));

            model.status = BaseModel.getString(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS));
            model.tenancyExpiry = BaseModel.getDate(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.TENANCY_EXPIRY));

            if (model.status === STATUS_REQUEST_USER.ARCHIVED) {
                model.archivedDate = BaseModel.getDate(dto.get(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            }

            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, filters);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

            let unitRelation: UnitDto = dto.related("unit") as UnitDto;
            if (unitRelation != null && unitRelation.id != null) {
                let unitModel = UnitModel.fromDto(unitRelation, filters);
                if (unitModel != null) {
                    model.unit = unitModel;
                }
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;
            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

        }
        UserUnitModel.filter(model, filters);
        return model;
    }

    public static toDto(model: UserUnitModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.userId != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.condoId != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.unitId != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
        }

        if (model.roleId != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID] = model.roleId;
        }

        if (model.proofUrls != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.PROOF_URL] = model.proofUrls;
        }

        if (model.remarks != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.REMARKS] = model.remarks;
        }

        if (model.isMaster != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_MASTER] = model.isMaster;
        }

        if (model.isResident != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT] = model.isResident;
        }

        if (model.status != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }

        if (model.tenancyExpiry != null) {
            dto[Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.TENANCY_EXPIRY] = model.tenancyExpiry;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): UserUnitModel {
        let ret = new UserUnitModel();
        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.unitId = this.getString(req.body.unitId);
            ret.userId = this.getString(req.body.userId);
            ret.roleId = this.getString(req.body.roleId);
            ret.proofUrls = this.getArrayString(req.body.proofUrls);
            ret.isMaster = this.getBoolean(req.body.isMaster);
            ret.isResident = this.getBoolean(req.body.isResident);
            ret.tenancyExpiry = this.getDate(req.body.tenancyExpiry);
        }
        return ret;
    }
}

export default UserUnitModel;
