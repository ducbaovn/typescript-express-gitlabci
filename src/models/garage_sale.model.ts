/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {BaseModel} from "./base.model";
import {CondoDto, GarageSaleDto, UserDto} from "../data/sql/models";
import {CondoModel} from "./condo.model";
import {GarageSaleCategoryModel} from "./garage_sale_category.model";
import {UserModel} from "./user.model";

export class GarageSaleModel extends BaseModel {
    public title: string;
    public type: string;
    public price: string;
    public content: string;
    public categoryId: string;
    public userId: string;
    public condoId: string;
    public datePost: momentTz.Moment;
    public images: string[];
    public status: string; // now, we don't use it, status use in extend in feature

    public isLike: boolean;
    public numberOfLike: number;
    public markResolved: boolean;

    public user: UserModel;
    public condo: CondoModel;

    public static fromDto(dto: GarageSaleDto, filters: string[] = []): GarageSaleModel {
        let model: GarageSaleModel = null;
        if (dto != null) {
            model = new GarageSaleModel();
            model.id = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.title = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TITLE));
            model.type = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TYPE));
            model.price = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.PRICE));
            model.content = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONTENT));
            model.categoryId = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.GARAGE_SALE_CATEGORY_ID));
            model.userId = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.USER_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.status = BaseModel.getString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.STATUS));
            model.datePost = BaseModel.getDate(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.DATE_POST));
            model.images = BaseModel.getArrayString(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IMAGES));
            model.markResolved = BaseModel.getBoolean(dto.get(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.MARK_RESOLVED)) || false;

            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;

            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, [...filters]);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }
        }
        GarageSaleModel.filter(model, filters);
        return model;
    }

    public static fromRequest(req: express.Request): GarageSaleModel {
        let ret = new GarageSaleModel();
        if (req != null && req.body != null) {
            ret.title = this.getString(req.body.title);
            ret.type = this.getString(req.body.type);
            ret.price = this.getString(req.body.price);
            ret.content = this.getString(req.body.content);
            ret.categoryId = this.getString(req.body.categoryId);
            ret.condoId = this.getString(req.body.condoId);
            ret.images = this.getArrayString(req.body.images);
            ret.markResolved = this.getBoolean(req.body.markResolved) || false;
        }
        return ret;
    }


    public static toDto(model: GarageSaleModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.title != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TITLE] = model.title;
        }
        if (model.type != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.price != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.PRICE] = model.price;
        }
        if (model.content != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONTENT] = model.content;
        }
        if (model.categoryId != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.GARAGE_SALE_CATEGORY_ID] = model.categoryId;
        }
        if (model.userId != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.condoId != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.images != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.IMAGES] = model.images;
        }
        if (model.datePost != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.DATE_POST] = model.datePost;
        }
        if (model.markResolved != null) {
            dto[Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.MARK_RESOLVED] = model.markResolved;
        }

        return dto;
    }

    public static fromSuspendRequest(req: express.Request): GarageSaleModel {
        let ret = new GarageSaleModel();

        if (req != null && req.body != null) {
            ret.isEnable = this.getBoolean(req.body.isEnable);
        }

        return ret;
    }
}

export default GarageSaleModel;
