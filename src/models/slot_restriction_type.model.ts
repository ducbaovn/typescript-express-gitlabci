import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotRestrictionTypeDto} from "../data/sql/models";

export class SlotRestrictionTypeModel extends BaseModel {
    public description: string;

    public static toResponse(modal: SlotRestrictionTypeModel): any {
    }

    public static fromRequest(data: any): SlotRestrictionTypeModel {
        return null;
    }

    public static fromDto(dto: SlotRestrictionTypeDto, filters = []): SlotRestrictionTypeModel {
        let model: SlotRestrictionTypeModel = null;

        if (dto != null) {
            model = new SlotRestrictionTypeModel();

            model.id = BaseModel.getString(dto.get(Schema.SLOT_RESTRICTION_TYPE_TABLE_SCHEMA.FIELDS.ID));
            model.description = BaseModel.getString(dto.get(Schema.SLOT_RESTRICTION_TYPE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }

        return model;
    }

    public static toDto(modal: SlotRestrictionTypeModel): any {
        let dto = {};
        return dto;
    }
}

export default SlotRestrictionTypeModel;
