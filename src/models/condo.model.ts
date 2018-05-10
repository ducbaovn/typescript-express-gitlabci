/**
 * Created by davidho on 1/12/17.
 */

import { BaseModel } from "./base.model";
import { HousingLoanModel, UserModel, PaymentGatewayAccountModel, FunctionPasswordModel } from "./";
import { CondoDto, UserDto, FunctionPasswordDto } from "../data/sql/models";
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";

export class CondoModel extends BaseModel {
    @Json("name")
    @Bookshelf(Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME)
    public name: string = undefined;
    public address1: string = undefined;
    public address2: string = undefined;
    public officePhone1: string = undefined;
    public officePhone2: string = undefined;
    public securityPhone: string = undefined;
    public email: string = undefined;
    public generalEmail: string = undefined;
    public newUserEmail: string = undefined;
    public onlineFormEmail: string = undefined;
    public feedbackEmail: string = undefined;
    public bookingEmail: string = undefined;
    public imageUrl: string = undefined;
    public latitude: number = undefined;
    public longitude: number = undefined;
    public postalCode: string = undefined;
    public country: string = undefined;
    public payByCash: boolean = undefined;
    public latestTransactionRent: string = undefined;
    public latestTransactionSale: string = undefined;
    public mcstNumber: string = undefined;
    public timezone: string = undefined;

    public paymentGatewayAccountId: string;
    public paymentGateway: string;
    public merchantId: string;
    public publicKey: string;
    public privateKey: string;

    public housingLoan: HousingLoanModel = undefined;
    public manager: UserModel[] = undefined;
    public functionPassword: FunctionPasswordModel = undefined;

    public static fromDto(dto: CondoDto, filters: string[] = []): CondoModel {
        let model: CondoModel = null;
        if (dto != null) {
            model = new CondoModel();
            model.id = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.name = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME));
            model.address1 = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS1));
            model.address2 = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS2));
            model.email = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.EMAIL));
            model.generalEmail = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.GENERAL_EMAIL));
            model.onlineFormEmail = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.ONLINE_FORM_NOTIFICATION_EMAIL));
            model.newUserEmail = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.NEW_USER_NOTIFICATION_EMAIL));
            model.feedbackEmail = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.FEEDBACK_NOTIFICATION_EMAIL));
            model.bookingEmail = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.BOOKING_NOTIFICATION_EMAIL));
            model.imageUrl = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.latitude = BaseModel.getNumber(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.LATITUDE));
            model.longitude = BaseModel.getNumber(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.LONGITUDE));
            model.country = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.COUNTRY));
            model.postalCode = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.POST_CODE));
            model.officePhone1 = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.OFFICE_PHONE1));
            model.officePhone2 = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.OFFICE_PHONE2));
            model.securityPhone = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.SECURITY_OFFICE_PHONE));
            model.payByCash = BaseModel.getBoolean(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.PAY_BY_CASH));
            model.mcstNumber = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER));
            model.timezone = BaseModel.getString(dto.get(Schema.CONDO_TABLE_SCHEMA.FIELDS.TIMEZONE));
        }
        let managerRelation: any = dto.related("manager");
        if (managerRelation != null && managerRelation.models != null) {
            model.manager = [];
            for (let modelDto of managerRelation.models) {
                let userDto = modelDto as UserDto;
                model.manager.push(UserModel.fromDto(userDto, filters));
            }
        }

        let paymentGatewayRelation: any = dto.related("paymentGatewayAccount");
        if (paymentGatewayRelation != null && paymentGatewayRelation.models != null && paymentGatewayRelation.models.length === 1) {
            let PaymentGatewayAccountDto = paymentGatewayRelation.models[0];
            let paymentGatewayAccount = PaymentGatewayAccountModel.fromDto(PaymentGatewayAccountDto, filters);
            if (paymentGatewayAccount != null) {
                model.paymentGatewayAccountId = paymentGatewayAccount.id;
                model.paymentGateway = paymentGatewayAccount.gateway;
                model.merchantId = paymentGatewayAccount.merchantId;
                model.privateKey = paymentGatewayAccount.privateKey;
                model.publicKey = paymentGatewayAccount.publicKey;
            }
        }

        let functionPasswordRelation: any = dto.related("functionPassword");
        if (functionPasswordRelation != null && functionPasswordRelation.models != null) {
            let functionPasswordDto = functionPasswordRelation.models[0] as FunctionPasswordDto;
            model.functionPassword = FunctionPasswordModel.fromDto(functionPasswordDto, filters);
        }
        CondoModel.filter(model, filters);

        return model;
    }

    public static toDto(model: CondoModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.address1 != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS1] = model.address1;
        }
        if (model.address2 != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.ADDRESS2] = model.address2;
        }
        if (model.country != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.COUNTRY] = model.country;
        }
        if (model.email != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.EMAIL] = model.email;
        }
        if (model.feedbackEmail != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.FEEDBACK_NOTIFICATION_EMAIL] = model.feedbackEmail;
        }
        if (model.bookingEmail != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.BOOKING_NOTIFICATION_EMAIL] = model.bookingEmail;
        }
        if (model.generalEmail != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.GENERAL_EMAIL] = model.generalEmail;
        }
        if (model.imageUrl != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.imageUrl;
        }
        if (model.latitude != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.LATITUDE] = model.latitude;
        }
        if (model.longitude != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.LONGITUDE] = model.longitude;
        }
        if (model.mcstNumber != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER] = model.mcstNumber;
        }
        if (model.name != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME] = model.name;
        }
        if (model.newUserEmail != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.NEW_USER_NOTIFICATION_EMAIL] = model.newUserEmail;
        }
        if (model.officePhone1 != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.OFFICE_PHONE1] = model.officePhone1;
        }
        if (model.officePhone2 != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.OFFICE_PHONE2] = model.officePhone2;
        }
        if (model.securityPhone != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.SECURITY_OFFICE_PHONE] = model.securityPhone;
        }
        if (model.onlineFormEmail != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.ONLINE_FORM_NOTIFICATION_EMAIL] = model.onlineFormEmail;
        }
        if (model.payByCash != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.PAY_BY_CASH] = model.payByCash;
        }
        if (model.postalCode != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.POST_CODE] = model.postalCode;
        }
        if (model.timezone != null) {
            dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.TIMEZONE] = model.timezone;
        }
        dto[Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE] = (model.isEnable != null) ? model.isEnable : false;

        return dto;
    }

    public static fromRequest(req: express.Request): CondoModel {
        let ret = new CondoModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.isEnable = this.getBoolean(req.body.isEnable);
            ret.address1 = this.getString(req.body.address1);
            ret.address2 = this.getString(req.body.address2);
            ret.country = this.getString(req.body.country);
            ret.email = this.getString(req.body.email);
            ret.generalEmail = this.getString(req.body.generalEmail);
            ret.newUserEmail = this.getString(req.body.newUserEmail);
            ret.onlineFormEmail = this.getString(req.body.onlineFormEmail);
            ret.feedbackEmail = this.getString(req.body.feedbackEmail);
            ret.bookingEmail = this.getString(req.body.bookingEmail);
            ret.imageUrl = this.getString(req.body.imageUrl);
            ret.latitude = this.getNumber(req.body.latitude);
            ret.longitude = this.getNumber(req.body.longitude);
            ret.name = this.getString(req.body.name);
            ret.officePhone1 = this.getString(req.body.officePhone1);
            ret.officePhone2 = this.getString(req.body.officePhone2);
            ret.securityPhone = this.getString(req.body.securityPhone);
            ret.payByCash = this.getBoolean(req.body.payByCash);
            ret.postalCode = this.getString(req.body.postalCode);
            ret.mcstNumber = this.getString(req.body.mcstNumber);
            ret.timezone = this.getString(req.body.timezone);
            ret.paymentGateway = this.getString(req.body.paymentGateway);
            ret.merchantId = this.getString(req.body.merchantId);
            ret.publicKey = this.getString(req.body.publicKey);
            ret.privateKey = this.getString(req.body.privateKey);
        }
        return ret;
    }

    public static fromCsvArray(data: any[]): CondoModel[] {
        let condos = [];
        for (let row of data) {
            let ret = new CondoModel();
            ret.name = this.getString(row[0]);
            ret.imageUrl = this.getString(row[1]);
            ret.address1 = this.getString(row[2]);
            ret.address2 = this.getString(row[3]);
            ret.latitude = this.getNumber(row[4]);
            ret.longitude = this.getNumber(row[5]);
            ret.country = this.getString(row[6]);
            ret.timezone = this.getString(row[7]);
            ret.postalCode = this.getString(row[8]);
            ret.email = this.getString(row[9]);
            ret.generalEmail = this.getString(row[10]);
            ret.newUserEmail = this.getString(row[11]);
            ret.onlineFormEmail = this.getString(row[12]);
            ret.feedbackEmail = this.getString(row[13]);
            ret.officePhone1 = this.getString(row[14]);
            ret.officePhone2 = this.getString(row[15]);
            ret.securityPhone = this.getString(row[16]);
            ret.mcstNumber = this.getString(row[17]);
            ret.payByCash = this.getBoolean(row[18]);
            ret.merchantId = this.getString(row[19]);
            ret.publicKey = this.getString(row[20]);
            ret.privateKey = this.getString(row[21]);
            condos.push(ret);
        }
        return condos;
    }
}

export default CondoModel;
