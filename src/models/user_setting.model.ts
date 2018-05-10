/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { UserModel } from "./";
import { FeedDto, UserDto, UserSettingDto } from "../data/sql/models";
import { NOTIFICATION_SETTING_DESCRIPTION } from "../libs/constants";

export class UserSettingModel extends BaseModel {
    public userId: string;
    public isReceiverPushChat: boolean;
    public isReceiverPushGarageSale: boolean;
    public isReceiverPushFindABuddy: boolean;
    public isReceiverPushChatterbox: boolean;
    public isReceiverPushLove: boolean;

    public chatDescription: string;
    public garageSaleDescription: string;
    public chatterboxDescription: string;
    public findABuddyDescription: string;
    public loveDescription: string;
    public user: UserModel;

    /**
     *
     * @param dto
     * @param filters
     * @returns {UserSettingModel}
     */
    public static fromDto(dto: UserSettingDto, filters: string[] = []): UserSettingModel {
        let model: UserSettingModel = null;

        if (dto != null) {
            model = new UserSettingModel();
            model.id = BaseModel.getString(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.isReceiverPushFindABuddy = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_FIND_A_BUDDY));
            model.isReceiverPushChat = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHAT));
            model.isReceiverPushGarageSale = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_GARAGE_SALE));
            model.isReceiverPushChatterbox = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHATTERBOX));
            model.isReceiverPushLove = BaseModel.getBoolean(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_LOVE));

            model.chatDescription = NOTIFICATION_SETTING_DESCRIPTION.CHAT;
            model.garageSaleDescription = NOTIFICATION_SETTING_DESCRIPTION.GARAGE_SALE;
            model.chatterboxDescription = NOTIFICATION_SETTING_DESCRIPTION.CHATTERBOX;
            model.findABuddyDescription = NOTIFICATION_SETTING_DESCRIPTION.FIND_A_BUDDY;
            model.loveDescription = NOTIFICATION_SETTING_DESCRIPTION.LOVE;

            model.userId = BaseModel.getString(dto.get(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.USER_ID));
            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

        }

        UserSettingModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {UserSettingModel}
     */
    public static fromRequest(req: express.Request): UserSettingModel {
        let ret = new UserSettingModel();

        if (req != null && req.body != null) {
            ret.isReceiverPushChat = this.getBoolean(req.body.isReceiverPushChat);
            ret.isReceiverPushFindABuddy = this.getBoolean(req.body.isReceiverPushFindABuddy);
            ret.isReceiverPushGarageSale = this.getBoolean(req.body.isReceiverPushGarageSale);
            ret.isReceiverPushChatterbox = this.getBoolean(req.body.isReceiverPushChatterbox);
            ret.isReceiverPushLove = this.getBoolean(req.body.isReceiverPushLove);
        }

        return ret;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: UserSettingModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.isReceiverPushFindABuddy != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_FIND_A_BUDDY] = model.isReceiverPushFindABuddy;
        }

        if (model.userId != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.isReceiverPushChat != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHAT] = model.isReceiverPushChat;
        }

        if (model.isReceiverPushGarageSale != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_GARAGE_SALE] = model.isReceiverPushGarageSale;
        }

        if (model.isReceiverPushChatterbox != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHATTERBOX] = model.isReceiverPushChatterbox;
        }

        if (model.isReceiverPushLove != null) {
            dto[Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_LOVE] = model.isReceiverPushLove;
        }

        return dto;
    }

    /**
     *
     * @returns {UserSettingModel}
     */
    public static defaultSetting(): UserSettingModel {
        let ret = new UserSettingModel();

            ret.isReceiverPushChat = true;
            ret.isReceiverPushFindABuddy = true;
            ret.isReceiverPushGarageSale = true;
            ret.isReceiverPushChatterbox = true;
            ret.isReceiverPushLove = true;

        return ret;
    }
}

export default UserSettingModel;
