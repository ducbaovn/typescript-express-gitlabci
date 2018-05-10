/**
 * Created by davidho on 3/6/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { BlockModel } from "./block.model";
import { FloorDto, BlockDto } from "../data/sql/models";
import { UnitModel } from "./unit.model";

export class FloorModel extends BaseModel {
    public floorNumber: string;
    public blockId: string;
    public block: BlockModel;
    public units: UnitModel[];

    public static fromDto(dto: FloorDto, filters: string[] = []): FloorModel {
        let model: FloorModel = null;
        if (dto != null) {
            model = new FloorModel();
            model.id = BaseModel.getString(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.floorNumber = BaseModel.getString(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER));
            model.blockId = BaseModel.getString(dto.get(Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID));

            let blockRelation: BlockDto = dto.related("block") as BlockDto;
            if (blockRelation != null && blockRelation.id != null) {
                let blockModel = BlockModel.fromDto(blockRelation, filters);
                if (blockModel != null) {
                    model.block = blockModel;
                }
            }

            let unitRelations: any = dto.related("units");

            if (unitRelations != null && unitRelations.models != null && unitRelations.models.length > 0) {
                model.units = [];
                unitRelations.models.forEach(unit => {
                    model.units.push(UnitModel.fromDto(unit, filters));
                });
            }
        }
        FloorModel.filter(model, filters);
        return model;
    }

    public static toDto(model: FloorModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.floorNumber != null) {
            dto[Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER] = model.floorNumber;
        }
        if (model.blockId != null) {
            dto[Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID] = model.blockId;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): FloorModel {
        let floor = new FloorModel();
        floor.id = req.body.id;
        floor.blockId = this.getString(req.body.blockId);
        floor.floorNumber = this.getString(req.body.floorNumber);
        return floor;
    }

    public static fromBulkRequest(req: express.Request): FloorModel[] {
        let floors = [];
        for (let item of req.body.data) {
            let floor = new FloorModel();
            floor.id = item.id;
            floor.blockId = this.getString(item.blockId);
            floor.floorNumber = this.getString(item.floorNumber);
            floors.push(floor);
        }
        return floors;
    }
}

export default FloorModel;
