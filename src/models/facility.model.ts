import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { FACILITIES_TABLE_SCHEMA } from "../data/sql/schema";
import { FacilityDto, SlotDto, SlotRestrictionDto } from "../data/sql/models";
import { SlotModel } from "./slot.model";
import { SlotRestrictionModel } from "./slot_restriction.model";

export class FacilityModel extends BaseModel {
    public condoId: string;

    @Json("name")
    @Bookshelf(FACILITIES_TABLE_SCHEMA.FIELDS.NAME)
    public name: string = undefined;

    public description: string = undefined;

    @Json("iconUrl")
    @Bookshelf(FACILITIES_TABLE_SCHEMA.FIELDS.ICON_URL)
    public iconUrl: string = undefined;

    public priority: number;
    // Support for client display.
    public minDuration: number;
    public maxDuration: number;

    public slotTypeId: string;
    public durationType: string;
    public restrictions: SlotRestrictionModel[];

    // Mapping with list slots.
    public slots: SlotModel[] = [];

    public allowBeforeEndTime: boolean;
    public images: string[];
    public quotaExempt: number;

    public static toResponse(modal: FacilityModel): any {

    }

    public static fromRequest(data: any): FacilityModel {
        let model: FacilityModel = new FacilityModel();

        if (data != null) {
            model.condoId = BaseModel.getString(data.condoId);
            model.name = BaseModel.getString(data.name);
            model.description = BaseModel.getString(data.description);
            model.iconUrl = BaseModel.getString(data.icon);
            model.isEnable = BaseModel.getBoolean(data.isEnable);
            // model.facilityType = BaseModel.getString(data.facilityType);
            model.priority = BaseModel.getNumber(data.priority, 0);

            model.iconUrl = BaseModel.getString(data.icon);
            model.iconUrl = BaseModel.getString(data.icon);

            model.slotTypeId = BaseModel.getString(data.slotTypeId);
            model.durationType = BaseModel.getString(data.durationType);

            model.allowBeforeEndTime = BaseModel.getBoolean(data.allowBeforeEndTime);
            model.images = BaseModel.getArrayString(data.images);
            model.quotaExempt = BaseModel.getNumber(data.quotaExempt);
            model.restrictions = [];

            if (data.restrictions != null && data.restrictions != null && data.restrictions.length > 0) {
                data.restrictions.forEach(element => {
                    model.restrictions.push(SlotRestrictionModel.fromRequest(element));
                });
            }


        }

        return model;
    }

    public static fromDto(dto: FacilityDto, filters = []): FacilityModel {
        let model: FacilityModel = null;

        if (dto != null) {
            model = new FacilityModel();

            model.id = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.condoId = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.name = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.NAME));
            model.iconUrl = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.ICON_URL));
            model.description = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            // model.facilityType = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.FACILITY_TYPE_ID));
            model.priority = BaseModel.getNumber(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.PRIORITY));

            model.slotTypeId = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID));
            model.durationType = BaseModel.getString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.DURATION_TYPE));
            model.allowBeforeEndTime = BaseModel.getBoolean(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.ALLOW_BEFORE_END_TIME));
            model.images = BaseModel.getArrayString(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.quotaExempt = BaseModel.getNumber(dto.get(FACILITIES_TABLE_SCHEMA.FIELDS.QUOTA_EXEMPT));

            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );

            let slotsRel: any = dto.related("slots");
            if (slotsRel != null && slotsRel.models != null && slotsRel.models.length > 0) {
                let slotCol: SlotDto[] = slotsRel.models as SlotDto[];
                model.slots = [];
                model.minDuration = Number.MAX_VALUE;
                model.maxDuration = Number.MIN_VALUE;

                slotCol.forEach(slot => {
                    let item: SlotModel = SlotModel.fromDto(slot, [...subFilters]);

                    if (item.rule) {
                        model.minDuration = item.rule.slotAvailableAdvance < model.minDuration ? item.rule.slotAvailableAdvance : model.minDuration;
                        model.maxDuration = item.rule.slotAvailableAdvance > model.maxDuration ? item.rule.slotAvailableAdvance : model.maxDuration;
                    }

                    model.slots.push(item);
                });
            }


            let restrictions: any = dto.related("restrictions");
            if (restrictions != null && restrictions.models != null && restrictions.models.length > 0) {
                model.restrictions = [];
                let arr: SlotRestrictionDto[] = restrictions.models as SlotRestrictionDto[];

                arr.forEach(item => {
                    model.restrictions.push(SlotRestrictionModel.fromDto(item, [...subFilters]));
                });
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: FacilityModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.isEnable != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
            }

            if (model.condoId != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
            }

            if (model.name != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.NAME] = model.name;
            }

            if (model.description != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.description;
            }

            if (model.iconUrl != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.ICON_URL] = model.iconUrl;
            }

            if (model.slotTypeId != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID] = model.slotTypeId;
            }

            if (model.durationType != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.DURATION_TYPE] = model.durationType;
            }

            // if (model.facilityType != null) {
            //     dto[FACILITIES_TABLE_SCHEMA.FIELDS.FACILITY_TYPE_ID] = model.facilityType;
            // }

            if (model.priority != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
            }

            if (model.allowBeforeEndTime != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.ALLOW_BEFORE_END_TIME] = model.allowBeforeEndTime;
            }

            if (model.images != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.images;
            }

            if (model.quotaExempt != null) {
                dto[FACILITIES_TABLE_SCHEMA.FIELDS.QUOTA_EXEMPT] = model.quotaExempt;
            }
        }

        return dto;
    }
}

export default FacilityModel;
