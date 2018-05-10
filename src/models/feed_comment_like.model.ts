/**
 * Created by davidho on 4/17/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {GarageSaleLikeDto, UserDto} from "../data/sql/models";
import {UserModel} from "./user.model";

export class FeedCommentLikeModel extends BaseModel {
    public userId: string;
    public commentId: string;

    public type: string;
    public isLike: boolean;
    public user: UserModel;

    /**
     *
     * @param req
     * @returns {FeedCommentLikeModel}
     */
    public static fromRequest(req: express.Request): FeedCommentLikeModel {
        let ret = new FeedCommentLikeModel();

        if (req != null && req.body != null) {
            ret.type = this.getString(req.body.type);
            ret.isLike = this.getBoolean(req.body.isLike);
        }

        return ret;
    }

    public static fromDto(dto: GarageSaleLikeDto, filters: string[] = []): FeedCommentLikeModel {
        let model: FeedCommentLikeModel = null;
        if (dto != null) {
            model = new FeedCommentLikeModel();
            model.id = BaseModel.getString(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.USER_ID));
            model.commentId = BaseModel.getString(dto.get(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.FEED_COMMENT_ID));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);

                if (userModel != null) {
                    model.user = userModel;
                }
            }
        }

        FeedCommentLikeModel.filter(model, filters);

        return model;
    }

    public static toDto(model: FeedCommentLikeModel): any {
        let dto = {};

        if (model.userId != null) {
            dto[Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.commentId != null) {
            dto[Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.FEED_COMMENT_ID] = model.commentId;
        }

        return dto;
    }
}

export default FeedCommentLikeModel;
