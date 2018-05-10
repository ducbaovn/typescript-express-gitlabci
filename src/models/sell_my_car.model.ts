import { BaseModel } from "./base.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import {SELL_MY_CAR_SCHEMA} from "../data/sql/schema";

export class SellMyCarModel extends BaseModel {
    @Json("email")
    @Bookshelf(SELL_MY_CAR_SCHEMA.FIELDS.EMAIL)
    public email: string = undefined;
    @Json("description")
    @Bookshelf(SELL_MY_CAR_SCHEMA.FIELDS.DESCRIPTION)
    public description: string = undefined;

    // for request quote
    @Json("userId")
    public userId: string = undefined;
    @Json("vehicleNumber")
    public vehicleNumber: string = undefined;
    @Json("passportNumber")
    public passportNumber: string = undefined;
    @Json("vehicleMilage")
    public vehicleMilage: string = undefined;

    public static fromRequest(data: any): SellMyCarModel {
        return JsonMapper.deserialize(SellMyCarModel, data);
    }

    public static toResponse(model: SellMyCarModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): SellMyCarModel {
        let data = BookshelfMapper.deserialize(SellMyCarModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: SellMyCarModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default SellMyCarModel;
