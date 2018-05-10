/**
 * Created by davidho on 1/14/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { FloorModel } from "./floor.model";
import { UnitDto, FloorDto } from "../data/sql/models";


export class UnitModel extends BaseModel {

    public stackNumber: string;
    public unitNumber: string;
    public floorId: string;
    public floor: FloorModel;

    public static fromDto(dto: UnitDto, filters: string[] = []): UnitModel {
        let model: UnitModel = null;
        if (dto != null) {
            model = new UnitModel();
            model.id = BaseModel.getString(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.stackNumber = BaseModel.getString(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER));
            model.unitNumber = BaseModel.getString(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER));
            model.floorId = BaseModel.getString(dto.get(Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID));

            let floorRelation: FloorDto = dto.related("floor") as FloorDto;
            if (floorRelation != null && floorRelation.id != null) {
                let floorModel = FloorModel.fromDto(floorRelation, filters);
                if (floorModel != null) {
                    model.floor = floorModel;
                }
            }
        }
        UnitModel.filter(model, filters);
        return model;
    }

    public static toDto(model: UnitModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.UNIT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.stackNumber != null) {
            dto[Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER] = model.stackNumber;
        }
        if (model.unitNumber != null) {
            dto[Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER] = model.unitNumber;
        }
        if (model.floorId != null) {
            dto[Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID] = model.floorId;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): UnitModel {
        let unit = new UnitModel();
        unit.id = req.body.id;
        unit.floorId = this.getString(req.body.floorId);
        unit.stackNumber = this.getString(req.body.stackNumber);
        unit.unitNumber = this.getString(req.body.unitNumber);
        return unit;
    }

    public static fromBulkRequest(req: express.Request): UnitModel[] {
        let units = [];
        for (let item of req.body.data) {
            let unit = new UnitModel();
            unit.id = item.id;
            unit.floorId = this.getString(item.floorId);
            unit.stackNumber = this.getString(item.stackNumber);
            unit.unitNumber = this.getString(item.unitNumber);
            units.push(unit);
        }
        return units;
    }
}

export default UnitModel;
