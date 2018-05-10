import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { SLOT_TIME_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotDurationModel } from "./slot_duration.model";
import { SlotTimeDto, SlotDurationDto, SlotTimeItemDto } from "../data/sql/models";
import { SlotTimeItemModel } from "./slot_time_item.model";

export class SlotTimeModel extends BaseModel {
    public facilityId: string;
    public slotId: string;
    public durationType: string;
    public timeItems: SlotTimeItemModel[];
    public durations: SlotDurationModel[] = [];
    public isoWeekday: number;

    public minStartTime: string;
    public maxEndTime: string;

    public static toResponse(modal: SlotTimeModel): any {
    }

    public static fromRequest(data: any, facilityId?: string): SlotTimeModel {
        let model: SlotTimeModel = new SlotTimeModel();

        if (data != null) {
            model.facilityId = facilityId;
            model.durationType = BaseModel.getString(data.durationType);
            model.isoWeekday = BaseModel.getNumber(data.isoWeekday);

            model.durations = [];
            if (data.durations != null && data.durations.length > 0) {
                data.durations.forEach(element => {
                    model.durations.push(SlotDurationModel.fromRequest(element, facilityId));
                });

                model.durations.sort((val1, val2) => {
                    let start1 = BaseModel.getTimeInterval(val1.startTime);
                    let start2 = BaseModel.getTimeInterval(val2.startTime);

                    if (start1.isBefore(start2)) {
                        return -1;
                    } else if (start1.isSame(start2)) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
            }

            model.timeItems = [];
            if (data.timeItems != null && data.timeItems.length > 0) {
                data.timeItems.forEach(item => {
                    model.timeItems.push(SlotTimeItemModel.fromRequest(item));
                });
            }
        }

        return model;
    }

    public static fromDto(dto: SlotTimeDto, filters = []): SlotTimeModel {
        let model = null;
        if (dto != null) {
            model = new SlotTimeModel();
            model.id = BaseModel.getString(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.facilityId = BaseModel.getString(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.FACILITY_ID));
            model.slotId = BaseModel.getString(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID));
            model.durationType = BaseModel.getString(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.DURATION_TYPE));
            model.isoWeekday = BaseModel.getNumber(dto.get(SLOT_TIME_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY));
            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );

            let durations: any = dto.related("durations");
            if (durations != null && durations.models != null && durations.models.length > 0) {
                model.durations = [];
                let arr: SlotDurationDto[] = durations.models as SlotDurationDto[];

                arr.forEach(item => {
                    model.durations.push(SlotDurationModel.fromDto(item, [...subFilters]));
                });
                let durationLength = model.durations.length;
                if (durationLength > 0) {
                    model.minStartTime = model.durations[0].startTime;
                    model.maxEndTime = model.durations[durationLength - 1].stopTime;
                }
            }

            let timeItems: any = dto.related("timeItems");
            if (timeItems != null && timeItems.models != null && timeItems.models.length > 0) {
                model.timeItems = [];
                let arr: SlotTimeItemDto[] = timeItems.models as SlotTimeItemDto[];

                arr.forEach(item => {
                    model.timeItems.push(SlotTimeItemModel.fromDto(item, [...subFilters]));
                });
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: SlotTimeModel): any {
        let dto = {};

        if (model != null) {
            dto[SLOT_TIME_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.facilityId != null) {
            dto[SLOT_TIME_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
        }
        if (model.slotId != null) {
            dto[SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID] = model.slotId;
        }

        if (model.durationType != null) {
            dto[SLOT_TIME_TABLE_SCHEMA.FIELDS.DURATION_TYPE] = model.durationType;
        }
        if (model.isoWeekday != null) {
            dto[SLOT_TIME_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY] = model.isoWeekday;
        }

        return dto;
    }
}

export default SlotTimeModel;
