/**
 * Created by davidho on 3/15/17.
 */

import {GatewayPayment} from "./config";
import * as StripeSDK from "stripe";
import * as _ from "lodash";
import * as Promise from "bluebird";
import {CustomerPaymentModel, CardModel, ExceptionModel, UserModel} from "../models";
import {CURRENCY} from "./constants";
import {ErrorCode, HttpStatus, Logger} from "./";

export class Stripe {
    private gatewayConfig: GatewayPayment;
    private gateway;

    constructor(_gatewayConfig: GatewayPayment) {
        this.gatewayConfig = _gatewayConfig;

        let defaultConf = {
            publicKey: "pk_test_x5QbX1gpGO1MlUpP02IVBRYr",
            privateKey: "sk_test_0CA93NZpcc0j61MTOXNpty2C"
        };

        this.gatewayConfig = _.defaultsDeep(_gatewayConfig, defaultConf) as GatewayPayment;
        this.gateway = StripeSDK(this.gatewayConfig.privateKey);
    }

    public createCustomer(user?: UserModel, cardToken?: string): Promise<any> {
        let data = {};
        if (cardToken) {
            data["source"] = cardToken;
        }
        if (user) {
            data["metadata"] = {
                firstName: user.firstName,
                lastName: user.lastName,
                unitNumber: user.unitNumber
            };
        }
        return new Promise((resolve, reject) => {
            this.gateway.customers.create(data, (err, customer) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(customer.id);
                }
            });
        });
    }

    public updateCustomerMetadata(user?: UserModel): Promise<any> {
        let data = {};
        if (user) {
            data["metadata"] = {
                firstName: user.firstName,
                lastName: user.lastName,
                unitNumber: user.unitNumber
            };
        }
        return new Promise((resolve, reject) => {
            this.gateway.customers.update(user.customerId, data, (err, customer) => {
                if (err) {
                    Logger.error(err);
                }
                resolve();
            });
        });
    }

    public findCustomer(customerId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customers.retrieve(customerId, (err, result) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(result);
                }
            });
        });
    }

    public createCard(customerId: string, cardToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customers.createSource(customerId, {
                source: cardToken
            }, (err, result) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(CardModel.fromStripeCreditCards(result, result.id));
                }
            });
        });
    }

    public updateCardDefault(customerId: string, cardId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customers.update(customerId, {
                default_source: cardId
            }, (err, result) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(result);
                }
            });
        });
    }

    public deleteCard(customerId: string, cardId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customers.deleteCard(customerId, cardId, (err, result) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(true);
                }
            });
        });
    }

    public createTransaction(customerId: string, amount: number, metadata?: any, currency: string = CURRENCY.SINGAPORE): Promise<any> {
        return new Promise((resolve, reject) => {
            if (currency === CURRENCY.SINGAPORE) {
                amount = amount * 100;
            }
            this.gateway.charges.create({
                amount: amount,
                currency: currency,
                customer: customerId,
                metadata: metadata
            }, (err, result) => {
                if (err) {
                    reject(this.handleError(err));
                } else {
                    resolve(result.id);
                }
            });
        });

    }

    public updateTransactionMetadata(transactionId: string, metadata: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.charges.update(transactionId, { metadata: metadata }, (err, transaction) => {
                if (err) {
                    Logger.error(err);
                }
                resolve();
            });
        });
    }

    private handleError(err) {
        let error;
        if (err.type === "StripeAuthenticationError") {
            error = new ExceptionModel(
                ErrorCode.PAYMENT.STRIPE_KEY_INVALID.CODE,
                ErrorCode.PAYMENT.STRIPE_KEY_INVALID.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            );
        } else if (err.code === "missing") {
            error = new ExceptionModel(
                ErrorCode.PAYMENT.MISSING_CUSTOMER_CARD.CODE,
                ErrorCode.PAYMENT.MISSING_CUSTOMER_CARD.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            );
        } else {
            error = err;
        }
        return error;
    }
}

export default Stripe;
