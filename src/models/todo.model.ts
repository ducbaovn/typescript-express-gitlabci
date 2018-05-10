/**
 * Created by ducbaovn on 08/05/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { MovingDto} from "../data/sql/models";
import {CondoModel} from "./condo.model";
import {UserModel} from "./user.model";

export class TodoModel extends BaseModel {
    public content: string;
    public condoId: string;
    public userId: string;
    public condo: CondoModel;
    public user: UserModel;

    public static fromDto(dto: MovingDto, filters: string[] = []): TodoModel {
        let model: TodoModel = null;
        if (dto != null) {
            model = new TodoModel();
            model.id = BaseModel.getString(dto.get(Schema.TODO_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.TODO_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.TODO_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.TODO_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.TODO_SCHEMA.FIELDS.UPDATED_DATE));
            model.content = BaseModel.getString(dto.get(Schema.TODO_SCHEMA.FIELDS.CONTENT));
            model.condoId = BaseModel.getString(dto.get(Schema.TODO_SCHEMA.FIELDS.CONDO_ID));
            model.userId = BaseModel.getString(dto.get(Schema.TODO_SCHEMA.FIELDS.USER_ID));

        }
        TodoModel.filter(model, filters);

        return model;
    }

    public static toDto(model: TodoModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.content != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.CONTENT] = model.content;
        }
        if (model.condoId != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.userId != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.isDeleted != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.isEnable != null) {
            dto[Schema.TODO_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): TodoModel {
        let ret = new TodoModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.content = this.getString(req.body.content);
            ret.condoId = this.getString(req.body.condoId);
        }
        return ret;
    }
}

export default TodoModel;
