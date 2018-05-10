/**
 * Created by davidho on 1/9/17.
 */
import * as Schema from "../data/sql/schema";
import * as momentTz from "moment-timezone";
import {BaseModel} from "./base.model";
import {SessionDto} from "../data/sql/models";
import {UserModel} from "./user.model";

export class SessionModel extends BaseModel {
    public userId: string;
    public token: string;
    public firebaseToken: string;
    public roleId: string;
    public expire: momentTz.Moment;
    public hash: string;
    public platform: string;

    public user: UserModel;
    public adminToken: string;


    public static empty(): SessionModel {
        let ret = new SessionModel();
        ret.userId = "";
        ret.expire = BaseModel.getDate(new Date());
        ret.hash = "";
        ret.platform = "";
        // ret.roleId = "";
        // ret.roleKeyword = "";
        ret.token = "";
        return ret;
    }

    public static fromDto(dto: SessionDto, filter = []): SessionModel {
        let model: SessionModel = null;
        if (dto != null) {
            model = new SessionModel();
            model.id = BaseModel.getString(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.userId = BaseModel.getString(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID));
            model.token = BaseModel.getString(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.TOKEN));
            model.expire = BaseModel.getDate(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.EXPIRE));
            model.hash = BaseModel.getString(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH));
            model.platform = BaseModel.getString(dto.get(Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM));
        }
        SessionModel.filter(model, filter);
        return model;
    }

    public static toDto(model: SessionModel): any {
        let dto = {};

        if (model.userId != null) {
            dto[Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.token != null) {
            dto[Schema.SESSION_TABLE_SCHEMA.FIELDS.TOKEN] = model.token;
        }
        if (model.expire != null) {
            dto[Schema.SESSION_TABLE_SCHEMA.FIELDS.EXPIRE] = model.expire;
        }
        if (model.hash != null) {
            dto[Schema.SESSION_TABLE_SCHEMA.FIELDS.HASH] = model.hash;
        }
        if (model.platform != null) {
            dto[Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM] = model.platform;
        }
        return dto;
    }

    public toResponse(): SessionModel {
        SessionModel.filter(this, ["isEnable", "isDeleted"]);
        return this;
    }

}
