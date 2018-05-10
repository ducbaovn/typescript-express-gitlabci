/**
 * Created by davidho on 4/17/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {GarageSaleLikeDto, UserDto} from "../data/sql/models";
import {UserModel} from "./user.model";

export class FeedLikeModel extends BaseModel {
    public userId: string;
    public feedId: string;

    public type: string;
    public isLike: boolean;
    public user: UserModel;

    /**
     *
     * @param req
     * @returns {FeedLikeModel}
     */
    public static fromRequest(req: express.Request): FeedLikeModel {
        let ret = new FeedLikeModel();

        if (req != null && req.body != null) {
            ret.type = this.getString(req.body.type);
            ret.isLike = this.getBoolean(req.body.isLike);
        }

        return ret;
    }

    public static fromDto(dto: GarageSaleLikeDto, filters: string[] = []): FeedLikeModel {
        let model: FeedLikeModel = null;
        if (dto != null) {
            model = new FeedLikeModel();
            model.id = BaseModel.getString(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.USER_ID));
            model.feedId = BaseModel.getString(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID));
            model.type = BaseModel.getString(dto.get(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.TYPE));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);

                if (userModel != null) {
                    model.user = userModel;
                }
            }
        }

        FeedLikeModel.filter(model, filters);

        return model;
    }

    public static toDto(model: FeedLikeModel): any {
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
            dto[Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.feedId != null) {
            dto[Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID] = model.feedId;
        }

        if (model.type != null) {
            dto[Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }

        return dto;
    }
}

export default FeedLikeModel;
