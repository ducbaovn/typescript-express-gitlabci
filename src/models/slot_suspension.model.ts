import * as moment from "moment";
import * as momentTz from "moment-timezone";
import { BaseModel, BookshelfDate, JsonDate } from "./base.model";
import { FacilityModel } from "./facility.model";
import { SlotModel } from "./slot.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { SLOT_SUSPENSION_TABLE_SCHEMA } from "../data/sql/schema";

export class SlotSuspensionModel extends BaseModel {

    @Json("targetId")
    @Bookshelf(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.TARGET_ID)
    public targetId: string = undefined;

    @Json({ name: "startDate", converter: JsonDate })
    @Bookshelf({ name: SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.START_TIME, converter: BookshelfDate })
    public startDate: momentTz.Moment = undefined;

    @Json({ name: "endDate", converter: JsonDate })
    @Bookshelf({ name: SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.END_TIME, converter: BookshelfDate })
    public endDate: momentTz.Moment = undefined;

    @Json("facilityId")
    @Bookshelf(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.FACILITY_ID)
    public facilityId: string = undefined;

    @Json("slotId")
    @Bookshelf(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.SLOT_ID)
    public slotId: string = undefined;

    @Json("note")
    @Bookshelf(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.NOTE)
    public note: string = undefined;

    @Json("facility")
    @Bookshelf({ relation: "facility", clazz: FacilityModel })
    public facility: FacilityModel = undefined;

    @Json("slot")
    @Bookshelf({ relation: "slot", clazz: SlotModel })
    public slot: SlotModel = undefined;

    public static fromRequest(data: any): SlotSuspensionModel {
        return JsonMapper.deserialize(SlotSuspensionModel, data);
    }

    public static toResponse(model: SlotSuspensionModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): SlotSuspensionModel {
        let data = BookshelfMapper.deserialize(SlotSuspensionModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: SlotSuspensionModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default SlotSuspensionModel;
