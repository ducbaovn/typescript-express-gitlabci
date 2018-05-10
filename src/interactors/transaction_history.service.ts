import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import {
    CollectionWrap,
    ExceptionModel,
    TransactionHistoryModel,
    BookingModel
} from "../models";
import {
    BookingRepository, CondoRepository, OnlineFormRepository,
    TransactionHistoryRepository
} from "../data";
import { ErrorCode, HttpStatus, Logger } from "../libs";
import {
    PAYMENT_STATUS,
    DEPOSIT_STATUS,
    TRANSACTION_ITEM_TYPE
} from "../libs/constants";
import { PaymentGatewayManager, PaymentSourceService } from "./index";
import * as Schema from "../data/sql/schema";

export class TransactionHistoryService extends BaseService<TransactionHistoryModel, typeof TransactionHistoryRepository> {
    constructor() {
        super(TransactionHistoryRepository);
    }


    /**
     * Get all transaction history.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<TransactionHistoryModel>>}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<TransactionHistoryModel>> {
        return TransactionHistoryRepository.search(searchParams, offset, limit, related, filters);
    }

    /**
     * Save transaction history.
     *
     * @param transaction
     * @returns {Bluebird<R>}
     */
    public saveTransaction(transaction: TransactionHistoryModel): Promise<TransactionHistoryModel> {
        return Promise.resolve()
            .then(() => {
                return this.checkConstraintsModel(transaction);
            })
            .then(() => {
                if (!transaction.payByCash && transaction.amount > 0) { // if transaction is free(ammount == 0), we don't call PaymentGateway
                    let metadata = {
                        firstName: transaction.firstName,
                        lastName: transaction.lastName,
                        unitNumber: transaction.unitNumber,
                        type: transaction.itemType,
                        name: transaction.name
                    };
                    return PaymentGatewayManager.charge(transaction.condoId, transaction.amount, transaction.customerId, metadata)
                    .then(transactionId => {
                        transaction.transactionId = transactionId;
                    });
                }
            })
            .then(result => {
                return TransactionHistoryRepository.insertGet(transaction);
            });
    }

    /**
     * Remove transaction history by id.
     *
     * @param id
     * @returns {Bluebird<boolean>}
     */
    public removeTransaction(id: string): Promise<boolean> {
        return TransactionHistoryRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    // region Private Method
    public checkConstraintsModel(transactionModel: TransactionHistoryModel): Promise<boolean> {
        return Promise.resolve()
            .then(() => {
                if (!transactionModel.condoId || !transactionModel.itemId || !transactionModel.itemType || (!transactionModel.payByCash && transactionModel.amount > 0 && !transactionModel.customerId)) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                // Validate the condo existing.
                return CondoRepository.findOne(transactionModel.condoId);
            })
            .then(condo => {
                if (condo == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return true;
            });
    }

    public updateAmount(booking: BookingModel): Promise<any> {
        let updateParams = {};
        updateParams[Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT] = booking.paymentStatus === PAYMENT_STATUS.NOT_APPLICABLE ? 0 : booking.paymentAmount;
        return TransactionHistoryRepository.updateByQuery(q => {
            q.where(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID, booking.id);
        }, updateParams);
    }
}

export default TransactionHistoryService;
