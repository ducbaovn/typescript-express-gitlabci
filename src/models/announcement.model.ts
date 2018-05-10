/**
 * Created by davidho on 2/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {AnnouncementDto, AnnouncementImageDto} from "../data/sql/models";
import {BaseModel} from "./base.model";
import {ExceptionModel} from "./";
import {ANNOUNCEMENT_STATUS} from "../libs/constants";
import {ErrorCode, HttpStatus} from "../libs";

export class AnnouncementModel extends BaseModel {

    public titleListView: string;
    public titleDetail: string;
    public description: string;
    public signature: string;
    public phone: string;
    public isPhoneEnable: boolean;
    public website: string;
    public isWebsiteEnable: boolean;
    public file: string;
    public isFileEnable: boolean;
    public coverPicture: string;

    public condoId: string;
    public datePost: momentTz.Moment;
    public expiryDate: momentTz.Moment;
    public images: string[];
    public readingCount: number;
    public isRead: boolean;

    public status: string;

    public static fromDto(dto: AnnouncementDto, filters: string[] = []): AnnouncementModel {
        let model: AnnouncementModel = null;
        if (dto != null) {
            model = new AnnouncementModel();
            model.id = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.titleListView = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW));
            model.titleDetail = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_DETAIL));

            model.description = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DESCRIPTION));
            model.signature = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.SIGNATURE));
            model.phone = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.PHONE));
            model.isPhoneEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE));
            model.website = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.WEBSITE));
            model.isWebsiteEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE));
            model.file = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.FILE));
            model.isFileEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE));
            model.coverPicture = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.COVER_PICTURE));
            model.condoId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.datePost = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST));
            model.expiryDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.EXPIRY_DATE));
            model.readingCount = BaseModel.getNumber(dto.get(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.READING_COUNT));
            let imageRelations: any = dto.related("images");
            model.images = [];

            if (model.coverPicture) {
                model.images.push(model.coverPicture);
            }

            if (imageRelations != null && imageRelations.models != null) {
                for (let modelDto of imageRelations.models) {
                    let announcementImageDto = modelDto as AnnouncementImageDto;
                    model.images.push(BaseModel.getString(announcementImageDto.get(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL)));
                }
            }

            model.status = model.expiryDate > momentTz() ? ANNOUNCEMENT_STATUS.ACTIVE : ANNOUNCEMENT_STATUS.ARCHIVED;
        }
        if (!model.titleListView || !model.titleDetail || !model.description || !model.signature || !model.condoId || !model.expiryDate) {
            throw new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            );
        }
        AnnouncementModel.filter(model, filters);
        return model;
    }

    public static toDto(model: AnnouncementModel): any {
        let dto = {};
        if (model.isDeleted != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.isEnable != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.id != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.titleListView != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW] = model.titleListView;
        }
        if (model.titleDetail != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_DETAIL] = model.titleDetail;
        }
        if (model.description != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.description;
        }
        if (model.signature != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.SIGNATURE] = model.signature;
        }
        if (model.phone != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.PHONE] = model.phone;
        }

        if (model.isPhoneEnable != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE] = model.isPhoneEnable;
        }

        if (model.website != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.WEBSITE] = model.website;
        }

        if (model.isWebsiteEnable != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE] = model.isWebsiteEnable;
        }

        if (model.file != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.FILE] = model.file;
        }

        if (model.isFileEnable != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE] = model.isFileEnable;
        }

        if (model.coverPicture != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.COVER_PICTURE] = model.coverPicture;
        }
        if (model.condoId != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.datePost != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST] = model.datePost;
        }
        if (model.expiryDate != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.EXPIRY_DATE] = model.expiryDate;
        }
        if (model.readingCount != null) {
            dto[Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.READING_COUNT] = model.readingCount;
        }
        return dto;
    }

    public static fromRequest(req: express.Request): AnnouncementModel {
        let ret = new AnnouncementModel();
        if (req != null && req.body != null) {
            ret.titleListView = this.getString(req.body.titleListView);
            ret.titleDetail = this.getString(req.body.titleDetail);
            ret.description = this.getString(req.body.description);
            ret.signature = this.getString(req.body.signature);
            ret.phone = this.getString(req.body.phone);
            ret.isPhoneEnable = this.getBoolean(req.body.isPhoneEnable);
            ret.website = this.getString(req.body.website);
            ret.isWebsiteEnable = this.getBoolean(req.body.isWebsiteEnable);
            ret.file = this.getString(req.body.file);
            ret.isFileEnable = this.getBoolean(req.body.isFileEnable);
            ret.coverPicture = this.getString(req.body.coverPicture);
            ret.condoId = this.getString(req.body.condoId);
            ret.datePost = this.getDate(req.body.datePost);
            ret.expiryDate = this.getDate(req.body.expiryDate);
            ret.images = this.getArrayString(req.body.images);
        }
        return ret;
    }
}

export default AnnouncementModel;
