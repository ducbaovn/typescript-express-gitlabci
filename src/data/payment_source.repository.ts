/**
 * Created by ducbaovn on 28/04/17.
 */

import {BaseRepository} from "./base.repository";
import {PaymentSourceDto} from "./sql/models";
import {PaymentSourceModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class PaymentSourceRepository extends BaseRepository<PaymentSourceDto, PaymentSourceModel> {
    constructor() {
        super(PaymentSourceDto, PaymentSourceModel, {
            fromDto: PaymentSourceModel.fromDto,
            toDto: PaymentSourceModel.toDto,
        });
    }
}
export  default PaymentSourceRepository;
