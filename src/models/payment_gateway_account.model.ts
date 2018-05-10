/**
 * Created by ducbaovn on 28/04/17.
 */

import { BaseModel, UserModel } from "./";
import { CondoDto, PaymentGatewayAccountDto } from "../data/sql/models";
import * as Schema from "../data/sql/schema";
import * as express from "express";

export class PaymentGatewayAccountModel extends BaseModel {
    public gateway: string;
    public merchantId: string;
    public publicKey: string;
    public privateKey: string;
    public condoId: string;

    public static fromDto(dto: PaymentGatewayAccountDto, filters: string[] = []): PaymentGatewayAccountModel {
        let model: PaymentGatewayAccountModel = null;
        if (dto != null) {
            model = new PaymentGatewayAccountModel();
            model.id = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.gateway = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.GATEWAY));
            model.merchantId = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.MERCHANT_ID));
            model.publicKey = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PUBLIC_KEY));
            model.privateKey = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY));
            model.condoId = BaseModel.getString(dto.get(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID));
        }
        return model;
    }

    public static toDto(model: PaymentGatewayAccountModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.gateway != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.GATEWAY] = model.gateway;
        }
        if (model.merchantId != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.MERCHANT_ID] = model.merchantId;
        }
        if (model.privateKey != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY] = model.privateKey;
        }
        if (model.publicKey != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PUBLIC_KEY] = model.publicKey;
        }
        if (model.condoId != null) {
            dto[Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        return dto;
    }

    public static fromRequest(req: express.Request): PaymentGatewayAccountModel {
        let ret = new PaymentGatewayAccountModel();
        if (req != null && req.body != null) {
            ret.id = req.body.id;
            ret.gateway = this.getString(req.body.gateway);
            ret.merchantId = this.getString(req.body.merchantId);
            ret.publicKey = this.getString(req.body.publicKey);
            ret.privateKey = this.getString(req.body.privateKey);
            ret.condoId = this.getString(req.body.condoId);
        }
        return ret;
    }
}

export default PaymentGatewayAccountModel;
