import { BrainTree } from "../libs/braintree";
import { Stripe } from "../libs/stripe";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { PaymentGatewayAccountRepository, CondoRepository, PaymentSourceRepository, TransactionHistoryRepository, BookingRepository, OnlineFormRequestItemsRepository } from "../data/index";
import { PaymentGatewayAccountModel, UserModel, CardModel, CustomerPaymentModel, CondoModel, ExceptionModel } from "../models";
import { PAYMENT_GATEWAY, TRANSACTION_ITEM_TYPE } from "../libs/constants";
import { ErrorCode, HttpStatus, Logger, Utils } from "../libs";
import * as Schema from "../data/sql/schema";

interface PaymentGatewayManagerOpts {
}

export class PaymentGatewayManager {
    private map: Map<string, any>;
    private opts: PaymentGatewayManagerOpts;
    constructor(opts?: any) {
        opts = opts || {};
        let defaultOpts: PaymentGatewayManagerOpts = {};
        this.opts = _.defaultsDeep(opts, defaultOpts) as PaymentGatewayManagerOpts;

        this.map = new Map();
    }

    private acquire(condoId: string, useCache: boolean = true): Promise<any> {
        let condo: CondoModel;
        if (condoId == null) {
            return Promise.reject(new Error());
        }
        if (useCache && this.map.has(condoId)) {
            return Promise.resolve(this.map.get(condoId));
        } else {
            return Promise.resolve()
                .then(() => {
                    return CondoRepository.findOne(condoId, ["paymentGatewayAccount"]);
                })
                .then(object => {
                    condo = object;
                    return Utils.decryptStringWithRsaPrivateKey(object.privateKey);
                })
                .then(privateKey => {
                    let paymentSDK;
                    let config = {
                        merchantId: condo.merchantId,
                        publicKey: condo.publicKey,
                        privateKey: privateKey
                    };
                    if (condo.paymentGateway === PAYMENT_GATEWAY.BRAINTREE) {
                        paymentSDK = new BrainTree(config);
                    }
                    if (condo.paymentGateway === PAYMENT_GATEWAY.STRIPE) {
                        paymentSDK = new Stripe(config);
                    }
                    this.map.set(condoId, paymentSDK);
                    return paymentSDK;
                });
        }
    }

    /**
     * Call this method when condonium manager change payment information. Call when update condo
     * Make sure the input information is right, other wise notify condonium manager the Error
     *
     * @param condoId Condo's ID
     * @returns Promise<BrainTree> SDK instance
     */
    public initSDKForCondo(condoId: string): Promise<any> {
        return this.acquire(condoId, false);
    }

    public getSDKForCondo(condoId: string): Promise<any> {
        return this.acquire(condoId, false);
    }

    public getClientKey(condo: CondoModel): Promise<any> {
        return this.getSDKForCondo(condo.id)
            .then(object => {
                if (object instanceof BrainTree) {
                    return {
                        gateway: PAYMENT_GATEWAY.BRAINTREE,
                        clientToken: object.generateClientToken()
                    };
                }
                if (object instanceof Stripe) {
                    return {
                        gateway: PAYMENT_GATEWAY.STRIPE,
                        clientToken: condo.publicKey
                    };
                }
            });
    }

    public createCustomer(condoId: string, user: UserModel): Promise<any> {
        let customer = CustomerPaymentModel.fromUserModel(user);
        return this.getSDKForCondo(condoId)
            .then(object => {
                if (object instanceof BrainTree) {
                    return object.createCustomer(customer);
                }
                if (object instanceof Stripe) {
                    return object.createCustomer(user);
                }
            });
    }

    public updateAllCustomerMetadata(condoId: string): Promise<any> {
        return PaymentSourceRepository.findByQuery((q => {
            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        }), ["user.unit"])
        .then(paymentSources => {
            return this.getSDKForCondo(condoId)
            .then(object => {
                return Promise.each(paymentSources, (paymentSource => {
                    if (object instanceof Stripe) {
                        paymentSource.user.customerId = paymentSource.customerId;
                        return object.updateCustomerMetadata(paymentSource.user);
                    }
                    return Promise.resolve();
                }));
            });
        });
    }

    public createCard(user: UserModel, cardToken: string, isDefault: boolean): Promise<CardModel> {
        return Promise.resolve()
            .then(() => {
                if (!user.customerId || !user.condo || !user.condo.id) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return this.getSDKForCondo(user.condo.id);
            })
            .then(object => {
                if (object instanceof BrainTree) {
                    return object.createPaymentMethod(user.customerId, cardToken, isDefault);
                }
                if (object instanceof Stripe) {
                    return object.createCard(user.customerId, cardToken);
                }
            });
    }

    public listCard(customerId: string, condoId: string, isDefault: boolean): Promise<CardModel[] | CardModel> {
        let paymentSDK: string;
        return this.getSDKForCondo(condoId)
            .then(object => {
                if (object instanceof BrainTree) {
                    paymentSDK = PAYMENT_GATEWAY.BRAINTREE;
                    return object.findCustomer(customerId);
                }
                if (object instanceof Stripe) {
                    paymentSDK = PAYMENT_GATEWAY.STRIPE;
                    return object.findCustomer(customerId);
                }
            })
            .then(object => {
                let creditCards: CardModel[] = [];
                if (paymentSDK === PAYMENT_GATEWAY.BRAINTREE) {
                    object.creditCards.forEach(card => {
                        let cardModel = CardModel.fromBraintreeCreditCards(card);
                        if (isDefault != null && cardModel.isDefault === isDefault) { // use for method get card default
                            creditCards.push(cardModel);
                        } else {
                            creditCards.push(cardModel);
                        }
                    });
                }
                if (paymentSDK === PAYMENT_GATEWAY.STRIPE) {
                    object.sources.data.forEach(card => {
                        let cardModel = CardModel.fromStripeCreditCards(card, object.default_source);
                        if (isDefault != null && object.default_source === card.id) { // use for method get card default
                            creditCards.push(cardModel);
                        } else {
                            creditCards.push(cardModel);
                        }
                    });
                }
                if (isDefault != null) {
                    return creditCards[0];
                }
                return creditCards;
            })
            .catch(err => {
                throw new ExceptionModel(
                    ErrorCode.OPEATION.PAYMENT_DISABLE.CODE,
                    ErrorCode.OPEATION.PAYMENT_DISABLE.MESSAGE,
                    false,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }

    public setCardDefault(condoId: string, cardToken: string, customerId: string): Promise<any> {
        return this.getSDKForCondo(condoId)
            .then(object => {
                if (object instanceof BrainTree) {
                    return object.updatePaymentMethodDefault(cardToken, true);
                }
                if (object instanceof Stripe) {
                    return object.updateCardDefault(customerId, cardToken);
                }
            });
    }

    public deleteCard(condoId: string, cardToken: string, customerId: string): Promise<any> {
        return this.getSDKForCondo(condoId)
            .then((object) => {
                if (object instanceof BrainTree) {
                    return object.deletePaymentMethod(cardToken);
                }
                if (object instanceof Stripe) {
                    return object.deleteCard(customerId, cardToken);
                }
            });
    }

    public charge(condoId: string, amount: number, customerId: string, metadata?: any): Promise<any> {
        return this.getSDKForCondo(condoId)
            .then((object) => {
                if (object instanceof BrainTree) {
                    return this.listCard(customerId, condoId, true)
                        .then((cardDefault: CardModel) => {
                            return object.createTransaction(amount, cardDefault.token);
                        });
                }
                if (object instanceof Stripe) {
                    return object.createTransaction(customerId, amount, metadata);
                }
            });
    }

    public updateAllChargeMetadata(condoId: string): Promise<any> {
        return TransactionHistoryRepository.findByQuery((q => {
            q.whereNotNull(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_ID);
            q.where(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        }), ["user.unit"])
        .then(transactions => {
            return this.getSDKForCondo(condoId)
            .then((object) => {
                return Promise.each(transactions, (transaction => {
                    if (object instanceof Stripe) {
                        if (transaction.itemType === TRANSACTION_ITEM_TYPE.BOOK_FACILITY) {
                            return BookingRepository.findOneByQuery((q => {
                                q.where(Schema.BOOKING_TABLE_SCHEMA.FIELDS.ID, transaction.itemId);
                            }), ["items.facility"])
                            .then(booking => {
                                let metadata = {
                                    firstName: transaction.user.firstName,
                                    lastName: transaction.user.lastName,
                                    unitNumber: transaction.user.unitNumber,
                                    type: TRANSACTION_ITEM_TYPE.BOOK_FACILITY,
                                    name: booking ? booking.items[0].facility.name : undefined
                                };
                                return object.updateTransactionMetadata(transaction.transactionId, metadata);
                            });
                        }
                        if (transaction.itemType === TRANSACTION_ITEM_TYPE.ONLINE_FORM) {
                            return OnlineFormRequestItemsRepository.findOneByQuery((q => {
                                q.where(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID, transaction.itemId);
                            }), ["onlineFormSubCategory.onlineFormCategory"])
                            .then(item => {
                                let metadata = {
                                    firstName: transaction.user.firstName,
                                    lastName: transaction.user.lastName,
                                    unitNumber: transaction.user.unitNumber,
                                    type: TRANSACTION_ITEM_TYPE.ONLINE_FORM,
                                    name: item ? item.onlineFormSubCategory.category.name : undefined
                                };
                                return object.updateTransactionMetadata(transaction.transactionId, metadata);
                            });
                        }
                    }
                    return Promise.resolve();
                }));
            });
        });
    }

    public validateAccount(paymentGatewayAccount: PaymentGatewayAccountModel): Promise<PaymentGatewayAccountModel> {
        return Promise.resolve()
            .then(() => {
                return Utils.decryptStringWithRsaPrivateKey(paymentGatewayAccount.privateKey);
            })
            .then(privateKey => {
                if (!paymentGatewayAccount.gateway) {
                    paymentGatewayAccount.gateway = PAYMENT_GATEWAY.STRIPE;
                }
                if (paymentGatewayAccount.gateway === PAYMENT_GATEWAY.BRAINTREE) {
                    if (!paymentGatewayAccount.publicKey || !paymentGatewayAccount.privateKey || !paymentGatewayAccount.merchantId) {
                        throw new ExceptionModel(
                            ErrorCode.PAYMENT.MISSING_PAYMENT_GATEWAY_ACCOUNT.CODE,
                            ErrorCode.PAYMENT.MISSING_PAYMENT_GATEWAY_ACCOUNT.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    return paymentGatewayAccount;
                }
                if (paymentGatewayAccount.gateway === PAYMENT_GATEWAY.STRIPE) {
                    if (!paymentGatewayAccount.publicKey || !paymentGatewayAccount.privateKey) {
                        throw new ExceptionModel(
                            ErrorCode.PAYMENT.MISSING_PAYMENT_GATEWAY_ACCOUNT.CODE,
                            ErrorCode.PAYMENT.MISSING_PAYMENT_GATEWAY_ACCOUNT.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    let config = {
                        merchantId: paymentGatewayAccount.merchantId,
                        publicKey: paymentGatewayAccount.publicKey,
                        privateKey: privateKey
                    };
                    let stripe = new Stripe(config);
                    return stripe.createCustomer()
                        .then(customerId => {
                            return paymentGatewayAccount;
                        });
                }
            });
    }

    public updateAccount(oldPaymentGatewayAccountId: string, paymentGatewayAccount: PaymentGatewayAccountModel): Promise<string> {
        return this.validateAccount(paymentGatewayAccount)
            .then(object => {
                if (!paymentGatewayAccount.condoId) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                this.map.delete(paymentGatewayAccount.condoId);
                if (oldPaymentGatewayAccountId) {
                    return PaymentGatewayAccountRepository.deleteLogic(oldPaymentGatewayAccountId)
                    .then(object => {
                        let deleteLogic = {
                            is_deleted: true
                        };
                        return PaymentSourceRepository.updateByQuery(q => {
                            q.where(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.PAYMENT_GATEWAY_ACCOUNT_ID, oldPaymentGatewayAccountId);
                        }, deleteLogic);
                    });
                }
            })
            .then(object => {
                return PaymentGatewayAccountRepository.insert(paymentGatewayAccount);
            })
            .then(paymentGatewayAccountDto => {
                return paymentGatewayAccountDto.id;
            });
    }
}

export default PaymentGatewayManager;
