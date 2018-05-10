/**
 * Created by ducbaovn on 08/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel, CondoModel, BlockModel, UnitModel } from "./";
import { MovingDto, CondoDto, BlockDto, UnitDto } from "../data/sql/models";

export class MovingModel extends BaseModel {
    public startDate: momentTz.Moment;
    public type: string;
    public condoId: string;
    public blockId: string;
    public unitId: string;
    public firstName: string;
    public lastName: string;
    public email: string;
    public phoneNumber: string;
    public userRole: string;
    public isDeposit: boolean;
    public isLiftPadding: boolean;
    public status: string;

    public condo: CondoModel;
    public blockNumber: string;
    public unitNumber: string;

    public static fromDto(dto: MovingDto, filters: string[] = []): MovingModel {
        let model: MovingModel = null;
        if (dto != null) {
            model = new MovingModel();
            model.id = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.startDate = BaseModel.getDate(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE));
            model.type = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.TYPE));
            model.condoId = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.blockId = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.BLOCK_ID));
            model.unitId = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.UNIT_ID));
            model.firstName = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.FIRST_NAME));
            model.lastName = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.LAST_NAME));
            model.email = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.EMAIL));
            model.phoneNumber = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.PHONE_NUMBER));
            model.userRole = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.USER_ROLE));
            model.isDeposit = BaseModel.getBoolean(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DEPOSIT));
            model.isLiftPadding = BaseModel.getBoolean(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_LIFT_PADDING));
            model.status = BaseModel.getString(dto.get(Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS));

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;
            if (condoRelation != null && condoRelation.id != null) {
                let condo = CondoModel.fromDto(condoRelation, filters);
                model.condo = condo;
            }

            let blockRelation: BlockDto = dto.related("block") as BlockDto;
            if (blockRelation != null && blockRelation.id != null) {
                let block = BlockModel.fromDto(blockRelation, filters);
                model.blockNumber = block.blockNumber;
            }

            let unitRelation: UnitDto = dto.related("unit") as UnitDto;
            if (unitRelation != null && unitRelation.id != null) {
                let unit = UnitModel.fromDto(unitRelation, filters);
                model.unitNumber = unit.unitNumber;
            }
        }
        MovingModel.filter(model, filters);

        return model;
    }

    public static toDto(model: MovingModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.startDate != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE] = model.startDate;
        }
        if (model.type != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.condoId != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.blockId != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.BLOCK_ID] = model.blockId;
        }
        if (model.unitId != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
        }
        if (model.firstName != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.FIRST_NAME] = model.firstName;
        }
        if (model.lastName != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.LAST_NAME] = model.lastName;
        }
        if (model.email != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }
        if (model.phoneNumber != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.PHONE_NUMBER] = model.phoneNumber;
        }
        if (model.userRole != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.USER_ROLE] = model.userRole;
        }
        if (model.isDeposit != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DEPOSIT] = model.isDeposit;
        }
        if (model.isLiftPadding != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_LIFT_PADDING] = model.isLiftPadding;
        }
        if (model.status != null) {
            dto[Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): MovingModel {
        let ret = new MovingModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.startDate = this.getDate(req.body.startDate);
            ret.type = this.getString(req.body.type);
            ret.condoId = this.getString(req.body.condoId);
            ret.blockId = this.getString(req.body.blockId);
            ret.unitId = this.getString(req.body.unitId);
            ret.firstName = this.getString(req.body.firstName);
            ret.lastName = this.getString(req.body.lastName);
            ret.email = this.getString(req.body.email);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.userRole = this.getString(req.body.userRole);
            ret.isDeposit = this.getBoolean(req.body.isDeposit);
            ret.isLiftPadding = this.getBoolean(req.body.isLiftPadding);
            ret.status = this.getString(req.body.status);
        }
        return ret;
    }
}

export default MovingModel;
