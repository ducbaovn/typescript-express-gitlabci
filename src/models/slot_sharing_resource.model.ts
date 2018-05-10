import * as _ from "lodash";
import { BaseModel } from "./base.model";
import { SlotModel } from "./";
import { SLOT_SHARING_RESOURCE_TABLE_SCHEMA } from "../data/sql/schema";
import { SlotSharingResourceDto, SlotDto } from "../data/sql/models";

export class SlotSharingResourceModel extends BaseModel {
    public slotId: string;
    public partnerSlotId: string;

    public partnerSlot: SlotModel;

    public static fromSlotData(partnerSlotIds: string[] = []): SlotSharingResourceModel[] {
        let result: SlotSharingResourceModel[] = [];
        partnerSlotIds.forEach(partnerSlotId => {
            let slotSharingResource = new SlotSharingResourceModel();
            slotSharingResource.partnerSlotId = partnerSlotId;
            result.push(slotSharingResource);
        });
        partnerSlotIds.forEach(partnerSlotId => {
            let slotSharingResource = new SlotSharingResourceModel();
            slotSharingResource.slotId = partnerSlotId;
            result.push(slotSharingResource);
        });

        return result;
    }

    public static fromDto(dto: SlotSharingResourceDto, filters = []): SlotSharingResourceModel {
        let model = null;

        if (dto != null) {
            model = new SlotSharingResourceModel();

            model.id = BaseModel.getString(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.slotId = BaseModel.getString(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.SLOT_ID));
            model.partnerSlotId = BaseModel.getString(dto.get(SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.PARTNER_SLOT_ID));

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

    public static toDto(model: SlotSharingResourceModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.slotId != null) {
                dto[SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.SLOT_ID] = model.slotId;
            }

            if (model.partnerSlotId != null) {
                dto[SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.PARTNER_SLOT_ID] = model.partnerSlotId;
            }
        }

        return dto;
    }
}

export default SlotSharingResourceModel;
