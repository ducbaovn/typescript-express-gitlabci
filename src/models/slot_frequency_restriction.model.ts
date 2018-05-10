import {BaseModel} from "./base.model";
import {SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA} from "../data/sql/schema";
import {SlotFrequencyRestrictionDto} from "../data/sql/models";

export class SlotFrequencyRestrictModel extends BaseModel {
    public name: string;
    public type: string;
    public conditionInterval: number;
    public desc: string;

    public static fromRequest(data: any): SlotFrequencyRestrictModel {
        let model: SlotFrequencyRestrictModel = new SlotFrequencyRestrictModel();

        if (data != null) {
            model.name = BaseModel.getString(data.name);
            model.type = BaseModel.getString(data.type);
            model.conditionInterval = BaseModel.getNumber(data.conditionInterval, 0);
            model.desc = BaseModel.getString(data.desc);
        }

        return model;
    }

    /**
     * Convert to model entity.
     *
     * @param dto
     * @param filters
     * @returns {SlotFrequencyRestrictModel}
     */
    public static fromDto(dto: SlotFrequencyRestrictionDto, filters = []): SlotFrequencyRestrictModel {
        let model: SlotFrequencyRestrictModel = null;

        if (dto != null) {
            model = new SlotFrequencyRestrictModel();

            model.id = BaseModel.getString(dto.get(SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.NAME));
            model.type = BaseModel.getString(dto.get(SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.TYPE));
            model.conditionInterval = BaseModel.getNumber(dto.get(SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.CONDITION_INTERVAL));
            model.desc = BaseModel.getString(dto.get(SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.DESCRIPTION));

            BaseModel.filter(model, filters);
        }

        return model;
    }

    /**
     * Convert to DTO entity.
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: SlotFrequencyRestrictModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.name != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.NAME] = model.name;
            }

            if (model.type != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
            }

            if (model.conditionInterval != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.CONDITION_INTERVAL] = model.conditionInterval;
            }

            if (model.desc != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
            }

            if (model.isEnable != null) {
                dto[SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
            }
        }

        return dto;
    }
}

export default SlotFrequencyRestrictModel;
