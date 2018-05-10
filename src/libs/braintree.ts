/**
 * Created by davidho on 3/15/17.
 */

import {GatewayPayment} from "./config";
import * as BrainTreeSDK from "braintree";
import * as _ from "lodash";
import * as Promise from "bluebird";
import {CustomerPaymentModel, ExceptionModel, CardModel} from "../models/";
import {ErrorCode, HttpStatus} from "./";

export class BrainTree {
    private gatewayConfig: GatewayPayment;
    private gateway;

    constructor(_gatewayConfig: GatewayPayment) {
        this.gatewayConfig = _gatewayConfig;

        let defaultConf = {
            merchantId: "7p22fqqcb6mfjvp4",
            publicKey: "znby9ccbq73wkzc7",
            privateKey: "14c493d639fc872d6338af51cb845701"
        };

        this.gatewayConfig = _.defaultsDeep(_gatewayConfig, defaultConf) as GatewayPayment;

        this.gateway = BrainTreeSDK.connect({
            environment: BrainTreeSDK.Environment.Sandbox,
            merchantId: this.gatewayConfig.merchantId,
            publicKey: this.gatewayConfig.publicKey,
            privateKey: this.gatewayConfig.privateKey
        });
    }

    /**
     * generateClientToken
     * @returns {Bluebird}
     */
    public generateClientToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.clientToken.generate({}, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response.clientToken);
                }
            });
        });
    }

    public createCustomer(customer: CustomerPaymentModel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customer.create({
                firstName: customer.firstName,
                lastName: customer.lastName,
                company: customer.company,
                email: customer.email,
                phone: customer.phone,
                fax: customer.fax,
                website: customer.website
            }, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.customer.id);
                }
            });
        });
    }

    public findCustomer(customerId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.customer.find(customerId
                , function (err, result) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    public createCreditCard(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.creditCard.create({
                customerId: "14155072",
                cardholderName: "Ho Anh Truc",
                expirationDate: "06/2020",
                number: "4111111111111111",
            }, function (err, result) {

                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }


    public createPaymentMethodNonce(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.paymentMethodNonce.create(token
                , function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    public createPaymentMethod(customerId: string, nonceFromTheClient: string, isDefault: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.paymentMethod.create({
                customerId: customerId,
                paymentMethodNonce: nonceFromTheClient,
                options: {
                    makeDefault: isDefault
                }
            }, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(CardModel.fromBraintreeCreditCards(result.creditCard));
                }
            });
        });
    }

    public updatePaymentMethodDefault(token: string, isDefault: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.paymentMethod.update(token, {
                options: {
                    makeDefault: isDefault
                }
            }, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    public deletePaymentMethod(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.gateway.paymentMethod.delete(token, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public createTransaction(amount: number, token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return Promise.resolve()
                .then(() => {
                    return this.createPaymentMethodNonce(token);
                })
                .then((object) => {
                    this.gateway.transaction.sale({
                        amount: amount,
                        paymentMethodNonce: object.paymentMethodNonce.nonce,
                    }, function (err, result) {
                        if (result.success === true) {
                            return resolve(result.transaction.id);
                        } else {
                            return reject(new ExceptionModel(
                                ErrorCode.PAYMENT.GENERIC.CODE,
                                ErrorCode.PAYMENT.GENERIC.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST,
                            ));
                        }
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });

    }


}

export default BrainTree;
