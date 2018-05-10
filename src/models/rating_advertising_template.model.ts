import { BaseModel } from "./base.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import {RATING_ADVERTISING_TEMPLATE_SCHEMA} from "../data/sql/schema";

export class RatingAdvertisingTemplateModel extends BaseModel {
    @Json("userId")
    @Bookshelf(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID)
    public userId: string = undefined;
    @Json("templateId")
    @Bookshelf(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID)
    public templateId: string = undefined;
    @Json("ratingValue")
    @Bookshelf(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.RATING_VALUE)
    public ratingValue: number = undefined;

    public static fromRequest(data: any): RatingAdvertisingTemplateModel {
        return JsonMapper.deserialize(RatingAdvertisingTemplateModel, data);
    }

    public static toResponse(model: RatingAdvertisingTemplateModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): RatingAdvertisingTemplateModel {
        let data = BookshelfMapper.deserialize(RatingAdvertisingTemplateModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: RatingAdvertisingTemplateModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default RatingAdvertisingTemplateModel;
