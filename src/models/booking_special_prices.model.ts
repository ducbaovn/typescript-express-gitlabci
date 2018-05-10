import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {SlotModel} from "./slot.model";
import {FacilityModel} from "./facility.model";
import {BookingSpecialPricesDto, SlotDto, FacilityDto} from "../data/sql/models";

export class BookingSpecialPricesModel extends BaseModel {
    public slotId: string;
    public facilityId: string;
    public type: string;
    public condition: string[];
    public slot: SlotModel;
    public facility: FacilityModel;
    public paymentAmount: number;
    public depositAmount: number;
    public priority: number;

    public static fromDto(dto: BookingSpecialPricesDto, filters: string[] = []): BookingSpecialPricesModel {
        let model: BookingSpecialPricesModel = null;
        if (dto != null) {
            model = new BookingSpecialPricesModel();
            model.id = BaseModel.getString(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.UPDATED_DATE));

            model.slotId = BaseModel.getString(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.SLOT_ID));
            model.facilityId = BaseModel.getString(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.FACILITY_ID));
            model.type = BaseModel.getString(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.TYPE));
            model.condition = BaseModel.getArrayString(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.CONDITION));
            model.paymentAmount = BaseModel.getNumber(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.PAYMENT_AMOUNT));
            model.depositAmount = BaseModel.getNumber(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.DEPOSIT_AMOUNT));
            model.priority = BaseModel.getNumber(dto.get(Schema.BOOKING_SPECIAL_PRICES.FIELDS.PRIORITY));

            let slotDto: SlotDto = dto.related("slot") as SlotDto;
            if (slotDto != null && slotDto.id != null) {
                let slotModel = SlotModel.fromDto(slotDto, filters);
                if (slotModel != null) {
                    model.slot = slotModel;
                }
            }

            let facilityDto: FacilityDto = dto.related("facility") as FacilityDto;
            if (facilityDto != null && facilityDto.id != null) {
                let facilityModel = FacilityModel.fromDto(facilityDto, filters);
                if (facilityModel != null) {
                    model.facility = facilityModel;
                }
            }
        }

        BookingSpecialPricesModel.filter(model, filters);
        return model;
    }

    public static toDto(model: BookingSpecialPricesModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.slotId != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.SLOT_ID] = model.slotId;
        }
        if (model.facilityId != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.FACILITY_ID] = model.facilityId;
        }
        if (model.type != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.TYPE] = model.type;
        }
        if (model.condition != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.CONDITION] = model.condition;
        }
        if (model.paymentAmount != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.PAYMENT_AMOUNT] = model.paymentAmount;
        }
        if (model.depositAmount != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.DEPOSIT_AMOUNT] = model.depositAmount;
        }
        if (model.priority != null) {
            dto[Schema.BOOKING_SPECIAL_PRICES.FIELDS.PRIORITY] = model.priority;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): BookingSpecialPricesModel {
        let ret = new BookingSpecialPricesModel();
        if (req != null && req.body != null) {
            ret.slotId = this.getString(req.body.slotId);
            ret.facilityId = this.getString(req.body.facilityId);
            ret.type = this.getString(req.body.type);
            ret.condition = this.getArrayString(req.body.condition);
            ret.paymentAmount = this.getNumber(req.body.paymentAmount);
            ret.depositAmount = this.getNumber(req.body.depositAmount);
            ret.priority = this.getNumber(req.body.priority);
        }
        return ret;
    }

    public static fromSlotData(data: any): BookingSpecialPricesModel[] {
        let result: BookingSpecialPricesModel[] = [];
        if (data != null) {
            data.forEach(item => {
                let ret = new BookingSpecialPricesModel();
                ret.slotId = this.getString(item.slotId);
                ret.facilityId = this.getString(item.facilityId);
                ret.type = this.getString(item.type);
                ret.condition = this.getArrayString(item.condition);
                ret.paymentAmount = this.getNumber(item.paymentAmount);
                ret.depositAmount = this.getNumber(item.depositAmount);
                ret.priority = this.getNumber(item.priority);

                result.push(ret);
            });
        }
        return result;
    }
}

export default BookingSpecialPricesModel;
