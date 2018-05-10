import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotTypeDto} from "../data/sql/models";

export class SlotTypeModel extends BaseModel {
    public description: string;

    public static toResponse(modal: SlotTypeModel): any {
    }

    public static fromRequest(data: any): SlotTypeModel {
        return null;
    }

    public static fromDto(dto: SlotTypeDto, filters = []): SlotTypeModel {
        let model: SlotTypeModel = null;

        if (dto != null) {
            model = new SlotTypeModel();

            model.id = BaseModel.getString(dto.get(Schema.SLOT_TYPE_TABLE_SCHEMA.FIELDS.ID));
            model.description = BaseModel.getString(dto.get(Schema.SLOT_TYPE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }

        return model;
    }

    public static toDto(modal: SlotTypeModel): any {
        let dto = {};
        return dto;
    }
}

export default SlotTypeModel;
