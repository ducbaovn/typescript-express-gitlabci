/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import {AnnouncementViewDto} from "../data/sql/models";
import {BaseModel} from "./base.model";

export class AnnouncementViewModel extends BaseModel {
    public userId: string;
    public announcementId: string;

    public static fromDto(dto: AnnouncementViewDto, filters: string[] = []): AnnouncementViewModel {
        let model: AnnouncementViewModel = null;
        if (dto != null) {
            model = new AnnouncementViewModel();
            model.id = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.USER_ID));
            model.announcementId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID));
        }
        AnnouncementViewModel.filter(model, filters);
        return model;
    }

    public static toDto(model: AnnouncementViewModel): any {
        let dto = {};

        if (model.userId != null) {
            dto[Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.announcementId != null) {
            dto[Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID] = model.announcementId;
        }

        return dto;
    }
}

export default AnnouncementViewModel;
