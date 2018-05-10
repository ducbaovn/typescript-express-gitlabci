import * as moment from "moment";
import * as momentTz from "moment-timezone";
import { BaseModel, BookshelfDate, JsonDate } from "./base.model";
import { FacilityModel } from "./facility.model";
import { SlotModel } from "./slot.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { VARIABLE_TABLE_SCHEMA } from "../data/sql/schema";

export class VariableModel extends BaseModel {

    @Json("keyword")
    @Bookshelf(VARIABLE_TABLE_SCHEMA.FIELDS.KEY)
    public keyword: string = undefined;

    @Json("value")
    @Bookshelf(VARIABLE_TABLE_SCHEMA.FIELDS.VALUE)
    public value: string = undefined;

    @Json("desc")
    @Bookshelf(VARIABLE_TABLE_SCHEMA.FIELDS.DESC)
    public desc: string = undefined;


    public static fromRequest(data: any): VariableModel {
        return JsonMapper.deserialize(VariableModel, data);
    }

    public static toResponse(model: VariableModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): VariableModel {
        let data = BookshelfMapper.deserialize(VariableModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: VariableModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default VariableModel;
