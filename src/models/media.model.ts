/**
 * Created by kiettv on 1/17/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {MediaDto} from "../data/sql/models";

export class MediaModel extends BaseModel {
    public path: string;
    public url: string;
    public signature: string;

    public static toResponse(modal: MediaModel): any {
        let ret: any = {};
        if (modal != null) {
            if (BaseModel.hasValue(modal.id)) {
                ret.id = modal.id;
            }
            if (BaseModel.hasValue(modal.createdDate)) {
                ret.createdDate = modal.createdDate.toDate();
            }
            if (BaseModel.hasValue(modal.updatedDate)) {
                ret.updatedDate = modal.createdDate.toDate();
            }
            if (BaseModel.hasValue(modal.path)) {
                ret.path = modal.path;
            }
            if (BaseModel.hasValue(modal.url)) {
                ret.url = modal.url;
            }
            if (BaseModel.hasValue(modal.signature)) {
                ret.signature = modal.signature;
            }
        }
        return ret;
    }

    public static fromRequest(data: any): MediaModel {
        if (data != null) {
            let modal = new MediaModel();
            modal.id = BaseModel.getString(data.id);
            modal.url = BaseModel.getString(data.url);
            modal.path = BaseModel.getString(data.path);
            modal.signature = BaseModel.getString(data.signature);
            return modal;
        }
        return null;
    }

    public static fromDataS3(data: any): MediaModel {
        if (data != null) {
            let modal = new MediaModel();
            modal.url = BaseModel.getString(data.Location);
            modal.path = BaseModel.getString(data.key);
            // modal.signature = BaseModel.getString(data.ETag);
            return modal;
        }
        return null;
    }

    public static toDto(modal: MediaModel): any {
        let dto = {};
        if (modal != null) {
            if (modal.id != null) {
                dto[Schema.MEDIA_TABLE_SCHEMA.FIELDS.ID] = modal.id;
            }
            if (modal.signature != null) {
                dto[Schema.MEDIA_TABLE_SCHEMA.FIELDS.HASH] = modal.signature;
            }
            if (modal.path != null) {
                dto[Schema.MEDIA_TABLE_SCHEMA.FIELDS.PATH] = modal.path;
            }
            if (modal.url != null) {
                dto[Schema.MEDIA_TABLE_SCHEMA.FIELDS.URL] = modal.url;
            }
        }
        return dto;
    }

    public static fromDto(dto: MediaDto, filters = []): MediaModel {
        if (dto != null) {
            let modal = new MediaModel();
            modal.id = BaseModel.getString(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.ID));
            modal.createdDate = BaseModel.getDate(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            modal.updatedDate = BaseModel.getDate(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            modal.isDeleted = BaseModel.getBoolean(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.IS_DELETED));
            modal.isEnable = BaseModel.getBoolean(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.IS_ENABLE));

            modal.path = BaseModel.getString(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.PATH));
            modal.url = BaseModel.getString(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.URL));
            modal.signature = BaseModel.getString(dto.get(Schema.MEDIA_TABLE_SCHEMA.FIELDS.HASH));

            MediaModel.filter(modal, filters);

            return modal;
        }
        return null;
    }
}

export default MediaModel;
