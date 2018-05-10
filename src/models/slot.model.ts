import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { FacilityModel, SlotRuleModel, SlotSuspensionModel, SlotTimeModel, BookingSpecialPricesModel, SlotSharingResourceModel } from "./";
import { SLOT_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotDto, SlotTimeDto, BookingSpecialPricesDto, SlotSharingResourceDto } from "../data/sql/models";

export class SlotModel extends BaseModel {
    @Json("name")
    @Bookshelf(SLOT_TABLE_SCHEMA.FIELDS.NAME)
    public name: string = undefined;
    public facilityId: string;
    public slotTypeId: string;
    public slotRuleId: string;
    public slotTimeId: string;

    public desc: string = undefined;

    public facility: FacilityModel;     // Mapping with Facility model.
    public rule: SlotRuleModel;         // Mapping with Slot Rule model.
    public slotTime: SlotTimeModel[] = [];     // Mapping with Slot Time model.
    public isAvailable: boolean;        // Variable support for booking, display slot available on mobile apps.
    public specialPrices: BookingSpecialPricesModel[] = [];
    public partnerSlotIds: string[] = [];
    public partnerSlots: SlotModel[] = [];
    public slotSharingResources: SlotSharingResourceModel[] = [];

    public static toResponse(modal: SlotModel): any {
    }

    public static fromRequest(data: any, facilityId?: string): SlotModel {
        let model: SlotModel = new SlotModel();
        if (data != null) {
            model.facilityId = facilityId;
            model.name = BaseModel.getString(data.name);

            model.slotTypeId = BaseModel.getString(data.slotTypeId);
            model.slotRuleId = BaseModel.getString(data.slotRuleId);
            model.slotTimeId = BaseModel.getString(data.slotTimeId);


            model.desc = BaseModel.getString(data.desc);
            model.isEnable = BaseModel.getBoolean(data.isEnable, true);
            model.isDeleted = BaseModel.getBoolean(data.isDeleted, false);
            model.specialPrices = BookingSpecialPricesModel.fromSlotData(data.specialPrices);
            model.partnerSlotIds = BaseModel.getArrayString(data.partnerSlotIds, []);
            model.slotSharingResources = SlotSharingResourceModel.fromSlotData(model.partnerSlotIds);

            // Rule
            if (data.rule != null) {
                model.rule = SlotRuleModel.fromRequest(data.rule, facilityId);
            }

            model.slotTime = [];
            // Slot time.
            if (data.slotTime != null) {
                data.slotTime.forEach((item, index) => {
                    model.slotTime.push(SlotTimeModel.fromRequest(item, facilityId));
                });
            }
        }

        return model;
    }

    public static fromDto(dto: SlotDto, filters = []): SlotModel {
        let model = null;

        if (dto != null) {
            model = new SlotModel();

            model.id = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.NAME));
            model.facilityId = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID));
            model.slotTypeId = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID));
            model.slotRuleId = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.SLOT_RULE_ID));
            model.desc = BaseModel.getString(dto.get(SLOT_TABLE_SCHEMA.FIELDS.DESCRIPTION));

            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );

            // Mapping with Facility.
            let facility: any = dto.related("facility");
            if (facility != null && facility.id != null) {
                model.facility = FacilityModel.fromDto(facility, [...subFilters]);
            }

            // Mapping with Rule.
            let rule: any = dto.related("rule");
            if (rule != null && rule.id != null) {
                model.rule = SlotRuleModel.fromDto(rule, [...subFilters]);
            }

            let slotTime: any = dto.related("slotTime");
            if (slotTime != null && slotTime.models != null && slotTime.models.length > 0) {
                model.slotTime = [];
                let arr: SlotTimeDto[] = slotTime.models as SlotTimeDto[];

                arr.forEach(item => {
                    model.slotTime.push(SlotTimeModel.fromDto(item, [...subFilters]));
                });
            }

            let specialPrices: any = dto.related("specialPrices");
            if (specialPrices != null && specialPrices.models != null && specialPrices.models.length > 0) {
                model.specialPrices = [];
                let arr: BookingSpecialPricesDto[] = specialPrices.models as BookingSpecialPricesDto[];

                arr.forEach(item => {
                    model.specialPrices.push(BookingSpecialPricesModel.fromDto(item, [...subFilters]));
                });
            }

            let partnerSlots: any = dto.related("partnerSlots");
            if (partnerSlots != null && partnerSlots.models != null && partnerSlots.models.length > 0) {
                let arr: SlotDto[] = partnerSlots.models as SlotDto[];

                arr.forEach(item => {
                    model.partnerSlots.push(SlotModel.fromDto(item, [...subFilters]));
                });
            }
            model.partnerSlots.forEach(slot => {
                model.partnerSlotIds.push(slot.id);
            });

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: SlotModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.name != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.NAME] = model.name;
            }

            if (model.facilityId != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
            }

            if (model.slotTypeId != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.SLOT_TYPE_ID] = model.slotTypeId;
            }

            if (model.slotRuleId != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.SLOT_RULE_ID] = model.slotRuleId;
            }

            if (model.desc != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
            }

            if (model.isEnable != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
            }

            if (model.isDeleted != null) {
                dto[SLOT_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
            }
        }

        return dto;
    }
}

export default SlotModel;
