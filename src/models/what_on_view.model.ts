/**
 * Created by davidho on 4/11/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {WhatOnViewDto} from "../data/sql/models";

export class WhatOnViewModel extends BaseModel {

    public userId: string;
    public whatOnId: string;

    public static fromDto(dto: WhatOnViewDto, filters: string[] = []): WhatOnViewModel {
        let model: WhatOnViewModel = null;
        if (dto != null) {
            model = new WhatOnViewModel();
            model.id = BaseModel.getString(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.USER_ID));
            model.whatOnId = BaseModel.getString(dto.get(Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.WHAT_ON_ID));

        }
        WhatOnViewModel.filter(model, filters);
        return model;
    }

    public static toDto(model: WhatOnViewModel): any {
        let dto = {};

        if (model.userId != null) {
            dto[Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.whatOnId != null) {
            dto[Schema.WHAT_ON_VIEW_TABLE_SCHEMA.FIELDS.WHAT_ON_ID] = model.whatOnId;
        }

        return dto;
    }
}

export default WhatOnViewModel;
