import * as _ from "lodash";
import * as momentTz from "moment-timezone";
import { BOOKING_ITEM_TABLE_SCHEMA } from "../data/sql/schema";
import { BaseModel } from "./base.model";
import { BookingItemDto, FacilityDto, SlotDto } from "../data/sql/models";
import { FacilityModel } from "./facility.model";
import { SlotModel } from "./slot.model";
import { SlotRuleModel } from "./slot_rule.model";
import { TIME_ZONE } from "../libs/constants";

export class BookingItemModel extends BaseModel {
    public bookingId: string;
    public eventStartDate: momentTz.Moment;
    public eventEndDate: momentTz.Moment;
    public startTime: string;
    public endTime: string;
    public paymentAmount: number;
    public depositAmount: number;
    public facilityId: string;
    public facilityName: string;        // Mapping facility name support display on mobile apps.
    public slotId: string;
    public slotName: string;
    public slotTimeTypeId: string;         // Mapping facility name support display on mobile apps.

    // Support display on mobile apps.
    public totalAmount: number;         // Mapping facility name support display on mobile apps: (paymentAmount + depositAmount)
    public isAllowCancel: boolean;      // Support display cancel button on mobile.

    public slot: SlotModel;
    public facility: FacilityModel;

    public static toResponse(modal: BookingItemModel): any {

    }

    public static fromRequest(data: any): BookingItemModel {
        let model: BookingItemModel = new BookingItemModel();

        if (data != null) {
            model.eventStartDate = BaseModel.getDate(data.eventStartDate);
            model.eventEndDate = model.eventStartDate.clone();
            model.startTime = BaseModel.getString(data.startTime);
            model.endTime = BaseModel.getString(data.endTime);
            model.slotId = BaseModel.getString(data.slotId);
            model.slotTimeTypeId = BaseModel.getString(data.slotTimeTypeId);
            model.paymentAmount = 0;
            model.depositAmount = 0;
            model.totalAmount = 0;
            if (data.id) {
                model.id = BaseModel.getString(data.id);
            }
        }

        return model;
    }

    public static fromDto(dto: BookingItemDto, filters = []): BookingItemModel {
        let model: BookingItemModel = null;
        let currentDate = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_DEFAULT);

        if (dto != null) {
            model = new BookingItemModel();

            model.id = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.eventStartDate = BaseModel.getDate(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_START_DATE));
            model.eventEndDate = BaseModel.getDate(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE));
            model.paymentAmount = BaseModel.getNumber(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT));
            model.depositAmount = BaseModel.getNumber(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT));
            model.startTime = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.START_TIME));
            model.endTime = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.END_TIME));
            model.facilityName = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME));
            model.slotName = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_NAME));
            model.slotId = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID));
            model.slotTimeTypeId = BaseModel.getString(dto.get(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID));

            // Total amount.
            model.totalAmount = model.paymentAmount + model.depositAmount;

            let slot: any = dto.related("slot");
            if (slot != null && slot.id != null) {
                let slotDto: SlotDto = slot as SlotDto;

                model.slot = SlotModel.fromDto(slotDto, filters);

                if (model.slot != null && model.slot.rule != null) {
                    let rule: SlotRuleModel = model.slot.rule;
                    model.isAllowCancel = !rule.canNotCancel;
                } else {
                    model.isAllowCancel = false;
                }
            }

            let facilityRelated: any = dto.related("facility");
            if (facilityRelated != null && facilityRelated.id != null) {
                let facility: FacilityDto = facilityRelated as FacilityDto;

                model.facility = FacilityModel.fromDto(facility, filters);
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: BookingItemModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.bookingId != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID] = model.bookingId;
            }

            if (model.eventStartDate != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_START_DATE] = model.eventStartDate;
            }

            if (model.eventEndDate != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE] = model.eventEndDate;
            }

            if (model.startTime != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.START_TIME] = model.startTime;
            }

            if (model.endTime != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.END_TIME] = model.endTime;
            }

            if (model.paymentAmount != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT] = model.paymentAmount;
            }

            if (model.depositAmount != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT] = model.depositAmount;
            }

            if (model.facilityId != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
            }

            if (model.facilityName != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME] = model.facilityName;
            }

            if (model.slotId != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID] = model.slotId;
            }

            if (model.slotName != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_NAME] = model.slotName;
            }
            if (model.slotTimeTypeId != null) {
                dto[BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = model.slotTimeTypeId;
            }
        }

        return dto;
    }
}

export default BookingItemModel;
