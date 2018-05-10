/**
 * Created by kiettv on 1/3/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {RoleDto} from "../data/sql/models";

export class RoleModel extends BaseModel {
    public name: string;
    public description: string;

    public static fromDto(dto: RoleDto, filters: string[] = []): RoleModel {
        let model: RoleModel = null;
        if (dto != null) {
            model = new RoleModel();
            model.id = BaseModel.getString(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.name = BaseModel.getString(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.NAME));
            model.description = BaseModel.getString(dto.get(Schema.ROLE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }
        RoleModel.filter(model, filters);
        return model;
    }

    public static toDto(model: RoleModel): any {
        let dto = {};
        if (model.isDeleted != null) {
            dto[Schema.ROLE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.isEnable != null) {
            dto[Schema.ROLE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isEnable;
        }
        if (model.name != null) {
            dto[Schema.ROLE_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }
        if (model.description != null) {
            dto[Schema.ROLE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.description;
        }
        return dto;
    }
}
