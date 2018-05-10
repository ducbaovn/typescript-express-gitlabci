/**
 * Created by ducbaovn on 28/04/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { CondoDto, PaymentSourceDto, UserDto } from "../data/sql/models";
import { UserModel } from "./";

export class PaymentSourceModel extends BaseModel {
    public customerId: string;
    public userId: string;
    public paymentGatewayAccountId: string;
    public condoId: string;

    public user: UserModel;

    public static fromDto(dto: PaymentSourceDto, filters: string[] = []): PaymentSourceModel {
        let model: PaymentSourceModel = null;
        if (dto != null) {
            model = new PaymentSourceModel();
            model.id = BaseModel.getString(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.customerId = BaseModel.getString(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CUSTOMER_ID));
            model.userId = BaseModel.getString(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.paymentGatewayAccountId = BaseModel.getString(dto.get(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.PAYMENT_GATEWAY_ACCOUNT_ID));

            let userDto: UserDto = dto.related("user") as UserDto;
            if (userDto != null && userDto.id != null) {
                let userModel = UserModel.fromDto(userDto, filters);
                if (userModel != null) {
                    model.user = userModel;
                }
            }
        }
        return model;
    }

    public static toDto(model: PaymentSourceModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.customerId != null) {
            dto[Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CUSTOMER_ID] = model.customerId;
        }
        if (model.userId != null) {
            dto[Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.condoId != null) {
            dto[Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.paymentGatewayAccountId != null) {
            dto[Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.PAYMENT_GATEWAY_ACCOUNT_ID] = model.paymentGatewayAccountId;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): PaymentSourceModel {
        let ret = new PaymentSourceModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.customerId = this.getString(req.body.customerId);
            ret.userId = this.getString(req.body.userId);
            ret.paymentGatewayAccountId = this.getString(req.body.paymentGatewayAccountId);
            ret.condoId = this.getString(req.body.condoId);
        }
        return ret;
    }
}

export default PaymentSourceModel;
