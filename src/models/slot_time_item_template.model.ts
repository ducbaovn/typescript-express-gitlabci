import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotTimeItemTemplateDto} from "../data/sql/models";

export class SlotTimeItemTemplateModel extends BaseModel {
    public name: string;
    public slotTypeId: string;
    public slotTimeTypeId: string;
    public priority: number;
    public desc: string;

    public static toResponse(modal: SlotTimeItemTemplateModel): any {

    }

    public static fromRequest(data: any): SlotTimeItemTemplateModel {
        return null;
    }

    public static fromDto(dto: SlotTimeItemTemplateDto, filters = []): SlotTimeItemTemplateModel {
        let model: SlotTimeItemTemplateModel = null;

        if (dto != null) {
            model = new SlotTimeItemTemplateModel();

            model.id = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME));
            model.slotTypeId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID));
            model.slotTimeTypeId = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID));
            model.priority = BaseModel.getNumber(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.desc = BaseModel.getString(dto.get(Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }

        return model;
    }

    public static toDto(model: SlotTimeItemTemplateModel): any {
        let dto = {};

        if (model != null && model.id != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.name != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }

        if (model.slotTypeId != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID] = model.slotTypeId;
        }

        if (model.slotTimeTypeId != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = model.slotTimeTypeId;
        }

        if (model.priority != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
        }

        if (model.desc != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
        }

        if (model.isEnable != null) {
            dto[Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        return dto;
    }
}

export default SlotTimeItemTemplateModel;
