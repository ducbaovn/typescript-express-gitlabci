import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { SLOT_RULES_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotDto, SlotRestrictionDto } from "../data/sql/models";
import { SlotModel } from "./slot.model";
import { SlotRestrictionModel } from "./slot_restriction.model";

export class SlotRuleModel extends BaseModel {
    public facilityId: string;
    public slotAvailableAdvance: number;
    public canNotCancel: boolean;
    public cancellationMinutes: number;
    public cancellationHours: number;
    public cancellationDays: number;
    public depositAmount: number;
    public paymentAmount: number;
    public termConditionUrl: string;



    public static toResponse(modal: SlotRuleModel): any {
    }

    public static fromRequest(data: any, facilityId?: string): SlotRuleModel {
        let model: SlotRuleModel = new SlotRuleModel();

        if (data != null) {
            model.facilityId = facilityId;
            model.slotAvailableAdvance = BaseModel.getNumber(data.slotAvailableAdvance);
            model.canNotCancel = BaseModel.getBoolean(data.canNotCancel);
            model.cancellationMinutes = BaseModel.getNumber(data.cancellationMinutes);
            model.cancellationHours = BaseModel.getNumber(data.cancellationHours);
            model.cancellationDays = BaseModel.getNumber(data.cancellationDays);
            model.depositAmount = BaseModel.getNumber(data.depositAmount);
            model.paymentAmount = BaseModel.getNumber(data.paymentAmount);
            model.termConditionUrl = BaseModel.getString(data.termConditionUrl);

        }

        return model;
    }

    public static fromDto(dto: SlotDto, filters = []): SlotRuleModel {
        let model = null;

        if (dto != null) {
            model = new SlotRuleModel();

            model.id = BaseModel.getString(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.facilityId = BaseModel.getString(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.FACILITY_ID));
            model.slotAvailableAdvance = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.SLOT_AVAILABLE_ADVANCE));
            model.canNotCancel = BaseModel.getBoolean(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.CAN_NOT_CANCEL));
            model.cancellationMinutes = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_MINUTES));
            model.cancellationHours = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_HOURS));
            model.cancellationDays = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_DAYS));
            model.depositAmount = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT));
            model.paymentAmount = BaseModel.getNumber(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT));
            model.termConditionUrl = BaseModel.getString(dto.get(SLOT_RULES_TABLE_SCHEMA.FIELDS.TERM_CONDITION_URL));

            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );



            BaseModel.filter(model, filters);
        }
        return model;
    }

    public static toDto(model: SlotRuleModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.facilityId != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.FACILITY_ID] = model.facilityId;
            }

            if (model.slotAvailableAdvance != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.SLOT_AVAILABLE_ADVANCE] = model.slotAvailableAdvance;
            }

            if (model.canNotCancel != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.CAN_NOT_CANCEL] = model.canNotCancel;
            }

            if (model.cancellationMinutes != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_MINUTES] = model.cancellationMinutes;
            }

            if (model.cancellationHours != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_HOURS] = model.cancellationHours;
            }

            if (model.cancellationDays != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.CANCELLATION_DAYS] = model.cancellationDays;
            }

            if (model.paymentAmount != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT] = model.paymentAmount;
            }

            if (model.depositAmount != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT] = model.depositAmount;
            }

            if (model.termConditionUrl != null) {
                dto[SLOT_RULES_TABLE_SCHEMA.FIELDS.TERM_CONDITION_URL] = model.termConditionUrl;
            }
        }

        return dto;
    }
}

export default SlotRuleModel;
