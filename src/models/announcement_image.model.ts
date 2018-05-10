/**
 * Created by davidho on 2/13/17.
 */
import * as Schema from "../data/sql/schema";
import {AnnouncementImageDto} from "../data/sql/models";
import {BaseModel} from "./base.model";

export class AnnouncementImageModel extends BaseModel {

    public imageURL: string;
    public orderIndex: number;
    public announcementId: string;

    public static fromDto(dto: AnnouncementImageDto, filters: string[] = []): AnnouncementImageModel {
        let model: AnnouncementImageModel = null;
        if (dto != null) {
            model = new AnnouncementImageModel();
            model.id = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.imageURL = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.orderIndex = BaseModel.getNumber(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX));
            model.announcementId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID));
        }
        AnnouncementImageModel.filter(model, filters);
        return model;
    }

    public static toDto(model: AnnouncementImageModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.imageURL != null) {
            dto[Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.imageURL;
        }
        if (model.orderIndex != null) {
            dto[Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX] = model.orderIndex;
        }
        if (model.announcementId != null) {
            dto[Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID] = model.announcementId;
        }
        return dto;
    }
}

export default AnnouncementImageModel;
