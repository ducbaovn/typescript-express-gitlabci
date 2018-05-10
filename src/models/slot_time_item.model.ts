import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotTimeItemDto} from "../data/sql/models";

export class SlotTimeItemModel extends BaseModel {
    public slotTimeId: string;
    public itemNameId: string;
    public slotTypeId: string;
    public slotTimeTypeId: string;
    public startTime: string;
    public stopTime: string;

    public static toResponse(modal: SlotTimeItemModel): any {

    }

    public static fromRequest(data: any): SlotTimeItemModel {
        let model: SlotTimeItemModel = new SlotTimeItemModel();

        if (data != null) {
            model.slotTimeId = BaseModel.getString(data.slotTimeId);
            model.itemNameId = BaseModel.getString(data.itemNameId);
            model.slotTypeId = BaseModel.getString(data.slotTypeId);
            model.slotTimeTypeId = BaseModel.getString(data.slotTimeTypeId);
            model.startTime = BaseModel.getString(data.startTime);
            model.stopTime = BaseModel.getString(data.stopTime);
        }

        return model;
    }

    public static fromDto(dto: SlotTimeItemDto, filters = []): SlotTimeItemModel {
        let model: SlotTimeItemModel = null;

        if (dto != null) {
            model = new SlotTimeItemModel();

            model.id = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.ID));
            model.itemNameId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.ITEM_NAME_ID));
            model.slotTimeId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID));
            model.slotTypeId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID));
            model.slotTimeTypeId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID));
            model.startTime = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.START_TIME));
            model.stopTime = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.END_TIME));
        }

        return model;
    }

    public static toDto(model: SlotTimeItemModel): any {
        let dto = {};

        if (model != null && model.id != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.itemNameId != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.ITEM_NAME_ID] = model.itemNameId;
        }

        if (model.slotTimeId != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID] = model.slotTimeId;
        }

        if (model.slotTypeId != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID] = model.slotTypeId;
        }

        if (model.slotTimeTypeId != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = model.slotTimeTypeId;
        }

        if (model.startTime != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.START_TIME] = model.startTime;
        }

        if (model.stopTime != null) {
            dto[Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.END_TIME] = model.stopTime;
        }

        return dto;
    }
}

export default SlotTimeItemModel;
