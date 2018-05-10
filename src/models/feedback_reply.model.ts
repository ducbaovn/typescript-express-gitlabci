import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {BaseModel} from "./base.model";
import {CondoModel, FeedbackCategoryModel, UnitModel, UserModel, FeedbackModel} from "./";
import {FeedbackReplyDto, FeedbackDto, UserDto, FeedbackCategoryDto, UnitDto, CondoDto} from "../data/sql/models";
import {FEEDBACK_STATUS, FEEDBACK_REPLY_STATUS} from "../libs/constants";

export class FeedbackReplyModel extends BaseModel {

    public content: string;
    public feedbackId: string;
    public userId: string;
    public user: UserModel;
    public images: string[];
    public feedback: FeedbackModel;

    public userAvatar: string;
    public userFirstName: string;
    public userLastName: string;
    public title: string;

    public static fromDto(dto: FeedbackReplyDto, filters: string[] = []): FeedbackReplyModel {
        let model: FeedbackReplyModel = null;
        if (dto != null) {
            model = new FeedbackReplyModel();
            model.id = BaseModel.getString(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID));
            model.feedbackId = BaseModel.getString(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID));
            model.content = BaseModel.getString(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CONTENT));
            model.images = BaseModel.getArrayString(dto.get(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IMAGE_URL));

            let feedbackRelation: FeedbackDto = dto.related("feedback") as FeedbackDto;
            if (feedbackRelation != null && feedbackRelation.id != null) {
                let feedbackModel = FeedbackModel.fromDto(feedbackRelation, filters);
                if (feedbackModel != null) {
                    model.feedback = feedbackModel;
                    model.title = feedbackModel.title;
                }
            }

            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null) {
                let userModel = UserModel.fromDto(userRelation, filters);
                if (userModel != null) {
                    model.user = userModel;
                    model.userAvatar = userModel.avatarUrl;
                    model.userFirstName = userModel.firstName;
                    model.userLastName = userModel.lastName;
                }
            }

        }
        FeedbackReplyModel.filter(model, filters);
        return model;
    }

    public static fromRequest(req: express.Request): FeedbackReplyModel {
        let ret = new FeedbackReplyModel();
        if (req != null && req.body != null) {
            ret.id = this.getString(req.body.id);
            ret.content = this.getString(req.body.content);
            ret.feedbackId = this.getString(req.body.feedbackId);
            ret.userId = this.getString(req.body.userId);
            ret.images = this.getArrayString(req.body.images);
        }
        return ret;
    }


    public static toDto(model: FeedbackReplyModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.content != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CONTENT] = model.content;
        }
        if (model.feedbackId != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID] = model.feedbackId;
        }
        if (model.userId != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.images != null) {
            dto[Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.images;
        }
        return dto;
    }
}

export default FeedbackReplyModel;
