/**
 * Created by ducbaovn on 28/04/17.
 */

import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { PaymentGatewayManager } from "./";
import { PaymentSourceModel, CondoModel, UserModel } from "../models";
import { PaymentSourceRepository } from "../data";
import * as Schema from "../data/sql/schema";
import { DELETE_STATUS, ENABLE_STATUS } from "../libs/constants";


export class PaymentSourceService extends BaseService<PaymentSourceModel, typeof PaymentSourceRepository> {
    constructor() {
        super(PaymentSourceRepository);
    }

    public create(user: UserModel, condo: CondoModel): Promise<PaymentSourceModel> {
        return PaymentGatewayManager.createCustomer(condo.id, user)
        .then(customerId => {
            let paymentSource = new PaymentSourceModel();
            paymentSource.customerId = customerId;
            paymentSource.userId = user.id;
            paymentSource.paymentGatewayAccountId = condo.paymentGatewayAccountId;
            paymentSource.condoId = condo.id;
            return PaymentSourceRepository.insert(paymentSource);
        })
        .then(paymentSourceDto => {
            return PaymentSourceModel.fromDto(paymentSourceDto);
        });
    }

    public findOrCreate(user: UserModel, condo: CondoModel): Promise<PaymentSourceModel> {
        return PaymentSourceRepository.findOneByQuery(q => {
            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID, condo.id);
            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID, user.id);
        })
        .then(paymentSource => {
            if (!paymentSource) {
                return this.create(user, condo);
            }
            return paymentSource;
        });
    }

}

export default PaymentSourceService;