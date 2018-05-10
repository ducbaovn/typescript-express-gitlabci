import {BaseModel} from "./base.model";
import {RoleModel, CondoModel, UnitModel, PaymentSourceModel, UserSettingModel, UserUnitModel} from "./";
import {UserDto, RoleDto, CondoDto, UserSettingDto, UserUnitDto, UnitDto} from "../data/sql/models";
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {ROLE} from "../libs/constants";

export class UserModel extends BaseModel {
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    public phoneNumber: string;
    public contactNumber: string;
    public avatarUrl: string;
    public roleId: string;
    public proofUrls: string[];
    public userStatus: string;
    public condoId: string;
    public agent: string;

    public customerId: string;
    public paymentSource: PaymentSourceModel;
    public role: RoleModel;
    public condo: CondoModel;
    public unit: UnitModel;
    public unitNumber: string;
    public userUnitId: string;
    public managerId: string;
    public condoManager: CondoModel;
    public securityId: string;
    public setting: UserSettingModel;

    public customUserRole: string;
    public emailContact: string;

    public isResident: boolean;
    public unitId: string;

    public static fromDto(dto: UserDto, filters = []): UserModel {
        let model: UserModel = null;
        if (dto != null) {
            model = new UserModel();
            model.id = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.firstName = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME));
            model.lastName = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME));
            model.email = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL));
            model.password = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.PASSWORD));
            model.phoneNumber = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER));
            model.contactNumber = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.CONTACT_NUMBER));
            model.avatarUrl = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.AVATAR_URL));
            model.roleId = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID));
            model.userStatus = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.STATUS));
            model.agent = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.AGENT));
            model.customUserRole = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOME_USER_ROLE));
            model.emailContact = BaseModel.getString(dto.get(Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL_CONTACT)) || model.email;

            let roleRelation: RoleDto = dto.related("role") as RoleDto;
            if (roleRelation != null && roleRelation.id != null) {
                let roleModel = RoleModel.fromDto(roleRelation, filters);
                if (roleModel != null) {
                    model.role = roleModel;
                }
            }

            let unitRelations: any = dto.related("unit");
            if (unitRelations != null && unitRelations.models != null && unitRelations.models.length === 1) {
                let unitDto = unitRelations.models[0] as UnitDto;
                let unitModel = UnitModel.fromDto(unitDto, filters);
                if (unitModel != null) {
                    model.unit = unitModel;
                    model.unitNumber = unitModel.unitNumber;
                }
            }

            let userUnitRelations: any = dto.related("userUnit");
            if (userUnitRelations != null && userUnitRelations.models != null && userUnitRelations.models.length === 1) {
                let userUnitDto = userUnitRelations.models[0] as UserUnitDto;
                let userUnit = UserUnitModel.fromDto(userUnitDto);
                model.isResident = userUnit.isResident;
                model.unitId = userUnit.unitId;
                model.condoId = userUnit.condoId;
            }

            let condoRelations: any = dto.related("condo");
            if (condoRelations != null && condoRelations.models != null && condoRelations.models.length === 1) {
                let condoDto = condoRelations.models[0] as CondoDto;
                let condoModel = CondoModel.fromDto(condoDto, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            let condoManagerRelations: any = dto.related("condoManager");
            if (condoManagerRelations != null && condoManagerRelations.models != null && condoManagerRelations.models.length === 1) {
                let condoDto = condoManagerRelations.models[0] as CondoDto;
                let condoModel = CondoModel.fromDto(condoDto, filters);
                if (condoModel != null) {
                    model.condoManager = condoModel;
                }
            }

            let condoSecurityRelations: any = dto.related("condoSecurity");
            if (condoSecurityRelations != null && condoSecurityRelations.models != null && condoSecurityRelations.models.length === 1) {
                let condoDto = condoSecurityRelations.models[0] as CondoDto;
                let condoModel = CondoModel.fromDto(condoDto, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            let settingRelation: UserSettingDto = dto.related("setting") as UserSettingDto;
            if (settingRelation != null && settingRelation.id != null) {
                let settingModel = UserSettingModel.fromDto(settingRelation, filters);
                if (settingModel != null) {
                    model.setting = settingModel;
                }
            }
        }
        UserModel.filter(model, filters);
        return model;
    }


    public static fromRequest(req: express.Request): UserModel {
        let ret = new UserModel();
        if (req != null && req.body != null) {
            ret.firstName = this.getString(req.body.firstName);
            ret.lastName = this.getString(req.body.lastName);
            ret.email = this.getString(req.body.email);
            ret.emailContact = ret.email;
            ret.password = this.getString(req.body.password);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.contactNumber = this.getString(req.body.contactNumber);
            ret.avatarUrl = this.getString(req.body.avatarUrl);
            ret.roleId = this.getString(req.body.roleId);
            ret.proofUrls = this.getArrayString(req.body.proofUrls);
            ret.userStatus = this.getString(req.body.status);
        }
        return ret;
    }

    public static fromRequestUserManager(req: express.Request): UserModel {
        let ret = new UserModel();
        if (req != null && req.body != null) {
            ret.firstName = this.getString(req.body.firstName);
            ret.lastName = this.getString(req.body.lastName);
            ret.email = this.getString(req.body.email);
            ret.password = this.getString(req.body.password);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.contactNumber = this.getString(req.body.contactNumber);
            ret.avatarUrl = this.getString(req.body.avatarUrl);
            ret.roleId = ROLE.CONDO_MANAGER;
            ret.condoId = this.getString(req.body.condoId);
            ret.agent = this.getString(req.body.agent);
            ret.customUserRole = this.getString(req.body.customUserRole);
            ret.emailContact = this.getString(req.body.emailContact) || ret.email;
        }
        return ret;
    }

    public static fromRequestCondoSecurity(req: express.Request): UserModel {
        let ret = new UserModel();
        if (req != null && req.body != null) {
            ret.id = this.getString(req.body.id);
            ret.firstName = this.getString(req.body.firstName);
            ret.lastName = this.getString(req.body.lastName);
            ret.email = this.getString(req.body.email);
            ret.password = this.getString(req.body.password);
            ret.phoneNumber = this.getString(req.body.phoneNumber);
            ret.contactNumber = this.getString(req.body.contactNumber);
            ret.avatarUrl = this.getString(req.body.avatarUrl);
            ret.roleId = ROLE.CONDO_SECURITY;
            ret.condoId = this.getString(req.body.condoId);
            ret.agent = this.getString(req.body.agent);
            ret.emailContact = this.getString(req.body.emailContact) || ret.email;
        }
        return ret;
    }

    public static toDto(model: UserModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.firstName != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME] = model.firstName;
        }

        if (model.lastName != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME] = model.lastName;
        }
        if (model.email != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }

        if (model.password != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.PASSWORD] = model.password;
        }

        if (model.phoneNumber != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER] = model.phoneNumber;
        }

        if (model.contactNumber != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.CONTACT_NUMBER] = model.contactNumber;
        }

        if (model.avatarUrl != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.AVATAR_URL] = model.avatarUrl;
        }

        if (model.roleId != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID] = model.roleId;
        }

        if (model.userStatus != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.STATUS] = model.userStatus;
        }

        if (model.agent != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.AGENT] = model.agent;
        }

        if (model.customUserRole != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOME_USER_ROLE] = model.customUserRole;
        }

        if (model.emailContact != null) {
            dto[Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL_CONTACT] = model.emailContact;
        }
        return dto;
    }

    public toResponse(): UserModel {
        UserModel.filter(this, ["password", "isEnable", "isDeleted"]);
        return this;
    }


}
