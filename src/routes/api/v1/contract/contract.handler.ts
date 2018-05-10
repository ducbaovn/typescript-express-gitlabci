/**
 * Created by ducbaovn on 04/05/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { BaseHandler } from "../base.handler";
import { ContractModel, ExceptionModel, StateModel } from "../../../../models";
import { ContractRepository } from "../../../../data";
import { ErrorCode, HttpStatus } from "../../../../libs";
import { ContractService } from "../../../../interactors";
import { STATUS_CONTRACT, PROPERTIES } from "../../../../libs/constants";

export class ContractHandler extends BaseHandler {
    /**
     * list contract
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        return ContractService.search(queryParams, offset, limit, [], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(contracts => {
            res.header(PROPERTIES.HEADER_TOTAL, contracts.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(contracts.data);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * detail contract
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        return ContractRepository.findOne(req.params.id, [], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(contract => {
            res.status(HttpStatus.OK);
            res.json(contract);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * create contract
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let contract: ContractModel;
        contract = ContractModel.fromRequest(req);

        if (!contract.condoId || !contract.type || !contract.vendorName || !contract.startDate || !contract.endDate || !contract.amount) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return ContractRepository.insert(contract)
        .then(contractDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(contractDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * update contract
     * @param req
     * @param res
     * @param next
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let contract: ContractModel;
        contract = ContractModel.fromRequest(req);
        contract.id = req.params.id;

        return ContractRepository.update(contract)
        .then(contractDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(contractDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * archive contract (update status to "archived")
     * @param req
     * @param res
     * @param next
     */
    public static archive(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return ContractService.archive(req.params.id)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * delete contract (delete logic)
     * @param req
     * @param res
     * @param next
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return ContractRepository.deleteLogic(req.params.id)
        .then(contractDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(contractDto.id));
        })
        .catch(err => {
            next(err);
        });
    }
}

export default ContractHandler;
