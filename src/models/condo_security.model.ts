/**
 * Created by davidho on 3/3/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel, UserModel, CondoModel} from "./";
import {CondoSecurityDto, UserDto, CondoDto} from "../data/sql/models";

export class CondoSecurityModel extends BaseModel {
    public userId: string;
    public condoId: string;

    public user: UserModel;
    public condo: CondoModel;

    public static fromDto(dto: CondoSecurityDto, filters: string[] = []): CondoSecurityModel {
        let model: CondoSecurityModel = null;
        if (dto != null) {
            model = new CondoSecurityModel();
            model.id = BaseModel.getString(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.userId = BaseModel.getString(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID));
        }

        let userRelation: UserDto = dto.related("user") as UserDto;
        if (userRelation != null && userRelation.id != null) {
            let user = UserModel.fromDto(userRelation, filters);
            model.user = user;
        }

        let condoRelation: CondoDto = dto.related("condo") as CondoDto;
        if (condoRelation != null && condoRelation.id != null) {
            let condo = CondoModel.fromDto(condoRelation, filters);
            model.condo = condo;
        }

        CondoSecurityModel.filter(model, filters);
        return model;
    }

    public static toDto(model: CondoSecurityModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.userId != null) {
            dto[Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.condoId !== undefined) {
            dto[Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        return dto;
    }
}

export default CondoSecurityModel;