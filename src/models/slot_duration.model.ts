import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { FacilityDto, SlotDurationDto, SlotTimeDto } from "../data/sql/models";
import { FacilityModel } from "./facility.model";
import { SLOT_DURATION_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotModel } from "./slot.model";
import { SlotTimeModel } from "./slot_time.model";

export class SlotDurationModel extends BaseModel {
    public facilityId: string;
    public slotId: string;                           // Slot contain durations. Support for booking
    public slotTimeId: string;
    public slotTypeId: string;
    public slotTimeTypeId: string;
    public startTime: string;
    public stopTime: string;
    public isAvailable: boolean = true;                    // Support for mobiles apps display the duration section not available.

    public facility: FacilityModel;
    public slotTime: SlotTimeModel;
    public slotsAvailable: SlotModel[];          // Contains list slot available support for booking.

    public isoWeekday: number;

    public static toResponse(modal: SlotDurationModel): any {

    }

    public static fromRequest(data: any, facilityId?: string): SlotDurationModel {
        let model: SlotDurationModel = new SlotDurationModel();

        if (data != null) {
            model.facilityId = facilityId;
            model.slotTimeId = BaseModel.getString(data.slotTimeId);
            model.slotTypeId = BaseModel.getString(data.slotTypeId);
            model.slotTimeTypeId = BaseModel.getString(data.slotTimeTypeId);
            model.startTime = BaseModel.getTimeInterval(data.startTime).format("HH:mm:ss");
            model.stopTime = BaseModel.getTimeInterval(data.stopTime).format("HH:mm:ss");
            model.isoWeekday = BaseModel.getNumber(data.isoWeekday);
        }

        return model;
    }

    public static fromDto(dto: SlotDurationDto, filters = []): SlotDurationModel {
        let model: SlotDurationModel = null;

        if (dto != null) {
            model = new SlotDurationModel();

            model.id = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.facilityId = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.FACILITY_ID));
            model.slotTimeId = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID));
            model.slotTypeId = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID));
            model.slotTimeTypeId = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID));
            model.startTime = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.START_TIME));
            model.stopTime = BaseModel.getString(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.END_TIME));
            model.isoWeekday = BaseModel.getNumber(dto.get(SLOT_DURATION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY));
            model.isAvailable = true;

            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );

            // Mapping with Facility info.
            let facility: any = dto.related("facility");
            if (facility != null && facility.id != null) {
                let facilityDto: FacilityDto = facility as FacilityDto;
                model.facility = FacilityModel.fromDto(facilityDto, [...subFilters]);
            }

            // Mapping with Slot Time.
            let slotTime: any = dto.related("slotTime");
            if (slotTime != null && slotTime.id != null) {
                let timeDto: SlotTimeDto = slotTime as SlotTimeDto;

                model.slotTime = SlotTimeModel.fromDto(timeDto, [...subFilters]);
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: SlotDurationModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.facilityId != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
            }

            if (model.slotTimeId != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID] = model.slotTimeId;
            }

            if (model.slotTypeId != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID] = model.slotTypeId;
            }

            if (model.slotTimeTypeId != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = model.slotTimeTypeId;
            }

            if (model.startTime != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.START_TIME] = model.startTime;
            }

            if (model.stopTime != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.END_TIME] = model.stopTime;
            }

            if (model.isoWeekday != null) {
                dto[SLOT_DURATION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY] = model.isoWeekday;
            }
        }

        return dto;
    }
}

export default SlotDurationModel;
