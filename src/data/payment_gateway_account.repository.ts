/**
 * Created by ducbaovn on 28/04/17.
 */

import {BaseRepository} from "./base.repository";
import {PaymentGatewayAccountDto} from "./sql/models";
import {PaymentGatewayAccountModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class PaymentGatewayAccountRepository extends BaseRepository<PaymentGatewayAccountDto, PaymentGatewayAccountModel> {
    constructor() {
        super(PaymentGatewayAccountDto, PaymentGatewayAccountModel, {
            fromDto: PaymentGatewayAccountModel.fromDto,
            toDto: PaymentGatewayAccountModel.toDto,
        });
    }
}
export  default PaymentGatewayAccountRepository;
