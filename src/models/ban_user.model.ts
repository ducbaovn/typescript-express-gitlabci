/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { UserModel } from "./user.model";
import {FeedDto, UserDto} from "../data/sql/models";

export class BanUserModel extends BaseModel {
    public userId: string;
    public condoId: string;
    public reason: string;
    public type: string;
    public user: UserModel;

    /**
     *
     * @param dto
     * @param filters
     * @returns {BanUserModel}
     */
    public static fromDto(dto: FeedDto, filters: string[] = []): BanUserModel {
        let model: BanUserModel = null;

        if (dto != null) {
            model = new BanUserModel();
            model.id = BaseModel.getString(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.type = BaseModel.getString(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.TYPE));
            model.condoId = BaseModel.getString(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.userId = BaseModel.getString(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID));
            model.reason = BaseModel.getString(dto.get(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.REASON));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

        }

        BanUserModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {BanUserModel}
     */
    public static fromRequest(req: express.Request): BanUserModel {
        let ret = new BanUserModel();

        if (req != null && req.body != null) {
            ret.condoId = this.getString(req.body.condoId);
            ret.userId = this.getString(req.body.userId);
            ret.type = this.getString(req.body.type);
            ret.reason = this.getString(req.body.reason);
        }

        return ret;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: BanUserModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.type != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }

        if (model.userId != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.condoId != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.reason != null) {
            dto[Schema.BAN_USER_TABLE_SCHEMA.FIELDS.REASON] = model.reason;
        }

        return dto;
    }
}

export default BanUserModel;
