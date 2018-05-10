/**
 * Created by davidho on 2/12/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {WhatOnImageDto} from "../data/sql/models";

export class WhatOnImageModel extends BaseModel {

    public imageURL: string;
    public orderIndex: number;
    public whatOnId: string;

    public static fromDto(dto: WhatOnImageDto, filters: string[] = []): WhatOnImageModel {
        let model: WhatOnImageModel = null;
        if (dto != null) {
            model = new WhatOnImageModel();
            model.id = BaseModel.getString(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.imageURL = BaseModel.getString(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.orderIndex = BaseModel.getNumber(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX));
            model.whatOnId = BaseModel.getString(dto.get(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.WHAT_ON_ID));
        }
        WhatOnImageModel.filter(model, filters);
        return model;
    }

    public static toDto(model: WhatOnImageModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.imageURL != null) {
            dto[Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.imageURL;
        }
        if (model.orderIndex != null) {
            dto[Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX] = model.orderIndex;
        }
        if (model.whatOnId != null) {
            dto[Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.WHAT_ON_ID] = model.whatOnId;
        }

        return dto;
    }
}

export default WhatOnImageModel;
