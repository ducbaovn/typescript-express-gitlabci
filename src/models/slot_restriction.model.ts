import { BaseModel } from "./base.model";
import { SLOT_RESTRICTION } from "../libs/constants";
import { SLOT_RESTRICTION_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotFrequencyRestrictModel } from "./slot_frequency_restriction.model";
import { SlotRestrictionDto } from "../data/sql/models";

export class SlotRestrictionModel extends BaseModel {
    public facilityId: string;
    public restrictionLevel: string;
    public slotTimeTypeId: string;
    public bookingNoLimit: boolean;
    public bookingQuantity: number;
    public bookingRestrictUnitId: string;
    public frequencyRestriction: SlotFrequencyRestrictModel;       // Mapping with Frequency Restriction model.
    // public isoWeekday: number;

    public static toResponse(modal: SlotRestrictionModel): any {
    }

    public static fromRequest(data: any): SlotRestrictionModel {
        let model: SlotRestrictionModel = new SlotRestrictionModel();

        if (data != null) {
            model.facilityId = BaseModel.getString(data.facilityId);
            model.restrictionLevel = BaseModel.getString(data.restrictionLevel);
            model.bookingNoLimit = BaseModel.getBoolean(data.bookingNoLimit);
            model.bookingQuantity = BaseModel.getNumber(data.bookingQuantity);
            model.bookingRestrictUnitId = BaseModel.getString(data.bookingRestrictUnitId);
            model.slotTimeTypeId = BaseModel.getString(data.slotTimeTypeId);
            // model.isoWeekday = BaseModel.getNumber(data.isoWeekday);
            // Currently default only one level: user
            if (model.restrictionLevel == null || model.restrictionLevel === "") {
                model.restrictionLevel = SLOT_RESTRICTION.LEVEL_UNIT;
            }
        }

        return model;
    }

    public static fromDto(dto: SlotRestrictionDto, filters = []): SlotRestrictionModel {
        let model: SlotRestrictionModel = null;

        if (dto != null) {
            model = new SlotRestrictionModel();
            model.id = BaseModel.getString(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.facilityId = BaseModel.getString(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.FACILITY_ID));
            model.restrictionLevel = BaseModel.getString(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.RESTRICTION_LEVEL));
            model.bookingNoLimit = BaseModel.getBoolean(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_NO_LIMIT));
            model.bookingQuantity = BaseModel.getNumber(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_QUANTITY));
            model.bookingRestrictUnitId = BaseModel.getString(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_RESTRICT_UNIT_ID));
            // model.isoWeekday = BaseModel.getNumber(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY));
            model.slotTimeTypeId = BaseModel.getString(dto.get(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID));
            // Mapping with frequency restriction info.
            let freRestrictRelated: any = dto.related("frequencyRestriction");

            if (freRestrictRelated != null && freRestrictRelated.id != null) {
                model.frequencyRestriction = SlotFrequencyRestrictModel.fromDto(freRestrictRelated, filters);
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: SlotRestrictionModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }


            if (model.facilityId != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
            }

            if (model.restrictionLevel != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.RESTRICTION_LEVEL] = model.restrictionLevel;
            }

            if (model.bookingNoLimit != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_NO_LIMIT] = model.bookingNoLimit;
            }

            if (model.bookingQuantity != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_QUANTITY] = model.bookingQuantity;
            }

            if (model.bookingRestrictUnitId != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_RESTRICT_UNIT_ID] = model.bookingRestrictUnitId;
            }

            // if (model.isoWeekday != null) {
            //     dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY] = model.isoWeekday;
            // }

            if (model.slotTimeTypeId != null) {
                dto[SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = model.slotTimeTypeId;
            }
        }

        return dto;
    }
}


export default SlotRestrictionModel;
