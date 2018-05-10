/**
 * Created by phuongho on 10/17/16.
 */
import _ = require("lodash");
import {BaseModel} from "./base.model";
import {UserModel, PushMessageModel} from "./";
import {NotificationDto, UserDto} from "../data/sql/models";
import {PUSH_NOTIFICATION_TYPE} from "../libs/constants";
import * as Schema from "../data/sql/schema";

export class NotificationModel extends BaseModel {
    public userId: string;
    public type: number;
    public groupType: string;
    public title: string;
    public body: string;
    public clickAction: string;
    public itemId: string;
    public isRead: boolean;

    public user: UserModel;

    public static fromPushMessage(message: PushMessageModel): NotificationModel {
        let notification = new NotificationModel();
        if (message.data != null && message.data.userId != null) {
            notification.userId = message.data.userId;
        }
        if (message.data != null && message.data.type != null) {
            notification.type = message.data.type;
            if (PUSH_NOTIFICATION_TYPE.GROUP_MY_CONDO.indexOf(message.data.type) !== -1) {
                notification.groupType = PUSH_NOTIFICATION_TYPE.MY_CONDO;
            } else if (PUSH_NOTIFICATION_TYPE.GROUP_SOCIAL.indexOf(message.data.type) !== -1) {
                notification.groupType = PUSH_NOTIFICATION_TYPE.SOCIAL;
            }
        }
        if (message.data != null && message.data.itemId) {
            notification.itemId = message.data.itemId;
        }
        if (message.title != null) {
            notification.title = message.title;
        }
        if (message.body != null) {
            notification.body = message.body;
        }
        if (message.clickAction != null) {
            notification.clickAction = message.clickAction;
        }
        return notification;
    }

    public static fromDto(dto: NotificationDto, filters: string[] = []): NotificationModel {
        let model: NotificationModel = null;
        if (dto != null) {
            model = new NotificationModel();
            model.id = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.userId = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.USER_ID));
            model.type = BaseModel.getNumber(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TYPE));
            model.groupType = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.GROUP_TYPE));
            model.title = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TITLE));
            model.body = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.BODY));
            model.clickAction = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CLICK_ACTION));
            model.itemId = BaseModel.getString(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ITEM_ID));
            model.isRead = BaseModel.getBoolean(dto.get(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_READ));

            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null && userRelation.id != null) {
                let user = UserModel.fromDto(userRelation, filters);
                model.user = user;
            }
        }
        NotificationModel.filter(model, filters);

        return model;
    }

    public static toDto(model: NotificationModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.userId != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.type != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.groupType != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.GROUP_TYPE] = model.groupType;
        }
        if (model.title != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TITLE] = model.title;
        }
        if (model.body != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.BODY] = model.body;
        }
        if (model.clickAction != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CLICK_ACTION] = model.clickAction;
        }
        if (model.itemId != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ITEM_ID] = model.itemId;
        }
        if (model.isRead != null) {
            dto[Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_READ] = model.isRead;
        }

        return dto;
    }
}

export default NotificationModel;
