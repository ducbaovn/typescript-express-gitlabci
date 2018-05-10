/**
 * Created by thanhphan on 4/28/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {ErrorCode, HttpStatus, Utils} from "../../../../libs";
import {
    ExceptionModel,
    StateModel,
    TransactionHistoryModel,
    BaseModel
} from "../../../../models";
import {TransactionHistoryService} from "../../../../interactors";
import Err = require("create-error");
import {PROPERTIES} from "../../../../libs/constants";

export class TransactionHandler {

    /**
     * Function get list useful contacts by condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;

            return TransactionHistoryService.search(queryParams, offset, limit, ["bookFacility", "onlineForm"])
                .then((items) => {
                    res.header(PROPERTIES.HEADER_TOTAL, items.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }

                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(items.data);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function get category detail.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let id = req.params.id || "";

            if (id === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return Promise.resolve()
                .then(() => {
                    return TransactionHistoryService.findOne(id, ["bookFacility", "onlineForm"]);
                })
                .then(item => {
                    if (item != null && item.id != null) {
                        res.status(HttpStatus.OK);
                        res.json(item);
                    } else {
                        next(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Save transaction.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    // public static saveTransaction(req: express.Request, res: express.Response, next: express.NextFunction): any {
    //     try {
    //         let transactionFromRq = TransactionHistoryModel.fromRequest(req.body);
    //         return TransactionHistoryService.saveTransaction(transactionFromRq)
    //             .then(object => {
    //                 if (object != null && object.id != null) {
    //                     res.json(StateModel.createSuccessful(object.id));
    //                 } else {
    //                     res.json(StateModel.stateError(ErrorCode.RESOURCE.SAVE_FAILED.CODE, ErrorCode.RESOURCE.SAVE_FAILED.MESSAGE));
    //                 }

    //                 res.status(HttpStatus.OK);
    //             })
    //             .catch(err => {
    //                 next(err);
    //             });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    /**
     * Function transaction history.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteTransactionHistory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let id = req.params.id || "";

            if (id === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return TransactionHistoryService.removeTransaction(id)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }
}

export default TransactionHandler;
