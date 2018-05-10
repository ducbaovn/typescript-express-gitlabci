import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotDurationTypeDto} from "../data/sql/models";

export class SlotDurationTypeModel extends BaseModel {
    public description: string;

    public static toResponse(modal: SlotDurationTypeModel): any {
    }

    public static fromRequest(data: any): SlotDurationTypeModel {
        return null;
    }

    public static fromDto(dto: SlotDurationTypeDto, filters = []): SlotDurationTypeModel {
        let model: SlotDurationTypeModel = null;

        if (dto != null) {
            model = new SlotDurationTypeModel();

            model.id = BaseModel.getString(dto.get(Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.FIELDS.ID));
            model.description = BaseModel.getString(dto.get(Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }

        return model;
    }

    public static toDto(modal: SlotDurationTypeModel): any {
        let dto = {};
        return dto;
    }
}

export default SlotDurationTypeModel;
