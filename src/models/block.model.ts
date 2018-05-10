/**
 * Created by davidho on 3/6/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { BlockDto, CondoDto } from "../data/sql/models";
import { CondoModel } from "./condo.model";
import { FloorModel } from "./floor.model";

export class BlockModel extends BaseModel {
    public blockNumber: string;
    public condoId: string;
    public floors: FloorModel[];
    public condo: CondoModel;

    public static fromDto(dto: BlockDto, filters: string[] = []): BlockModel {
        let model: BlockModel = null;
        if (dto != null) {
            model = new BlockModel();
            model.id = BaseModel.getString(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.blockNumber = BaseModel.getString(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER));
            model.condoId = BaseModel.getString(dto.get(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID));

            let floorRelations: any = dto.related("floors");
            if (floorRelations != null && floorRelations.models != null && floorRelations.models.length > 0) {
                model.floors = [];
                floorRelations.models.forEach(floor => {
                    model.floors.push(FloorModel.fromDto(floor, filters));
                });
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;
            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }
        }
        BlockModel.filter(model, filters);
        return model;
    }

    public static toDto(model: BlockModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.blockNumber != null) {
            dto[Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER] = model.blockNumber;
        }
        if (model.condoId != null) {
            dto[Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): BlockModel {
        let block = new BlockModel();
        block.id = req.body.id;
        block.blockNumber = this.getString(req.body.blockNumber);
        block.condoId = this.getString(req.body.condoId);
        return block;
    }

    public static fromBulkRequest(req: express.Request): BlockModel[] {
        let blocks = [];
        for (let item of req.body.data) {
            let block = new BlockModel();
            block.id = item.id;
            block.blockNumber = this.getString(item.blockNumber);
            block.condoId = this.getString(item.condoId);
            blocks.push(block);
        }
        return blocks;
    }
}

export default BlockModel;
