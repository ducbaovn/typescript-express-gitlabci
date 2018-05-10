/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { FeedDto, UserDto} from "../data/sql/models";
import { UserModel } from "./user.model";

export class FeedCommentModel extends BaseModel {
    public userId: string;
    public feedId: string;
    public content: string;

    public type: string;    // make same as Feed type.
    public user: UserModel;
    public numberOfLike: number;
    public isLike: boolean;

    /**
     *
     * @param dto
     * @param filters
     * @returns {FeedCommentModel}
     */
    public static fromDto(dto: FeedDto, filters: string[] = []): FeedCommentModel {
        let model: FeedCommentModel = null;

        if (dto != null) {
            model = new FeedCommentModel();
            model.id = BaseModel.getString(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.USER_ID));
            model.feedId = BaseModel.getString(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID));
            model.content = BaseModel.getString(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.CONTENT));
            model.type = BaseModel.getString(dto.get(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.TYPE));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }
        }

        FeedCommentModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {FeedCommentModel}
     */
    public static fromRequest(req: express.Request): FeedCommentModel {
        let ret = new FeedCommentModel();

        if (req != null && req.body != null) {
            ret.type = this.getString(req.body.type);
            ret.content = this.getString(req.body.content);
        }

        return ret;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: FeedCommentModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.userId != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.feedId != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID] = model.feedId;
        }

        if (model.content != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.CONTENT] = model.content;
        }

        if (model.type != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }

        return dto;
    }
}

export default FeedCommentModel;
