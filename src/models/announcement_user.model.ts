/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { UserModel } from "./user.model";
import {FeedDto, UserDto} from "../data/sql/models";

export class AnnouncementUserModel extends BaseModel {
    public userId: string;
    public announcementId: string;
    public reason: string;
    public type: string;
    public user: UserModel;

    /**
     *
     * @param dto
     * @param filters
     * @returns {BanUserModel}
     */
    public static fromDto(dto: FeedDto, filters: string[] = []): AnnouncementUserModel {
        let model: AnnouncementUserModel = null;

        if (dto != null) {
            model = new AnnouncementUserModel();
            model.id = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.announcementId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID));
            model.userId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.USER_ID));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

        }

        AnnouncementUserModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {BanUserModel}
     */
    public static fromRequest(req: express.Request): AnnouncementUserModel {
        let ret = new AnnouncementUserModel();

        if (req != null && req.body != null) {
            ret.announcementId = this.getString(req.body.announcementId);
            ret.userId = this.getString(req.body.userId);
        }

        return ret;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AnnouncementUserModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.userId != null) {
            dto[Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.announcementId != null) {
            dto[Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID] = model.announcementId;
        }

        return dto;
    }
}

export default AnnouncementUserModel;
