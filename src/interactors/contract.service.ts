/**
 * Created by ducbaovn on 28/04/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {ContractModel, CollectionWrap, ExceptionModel} from "../models";
import {ContractRepository} from "../data";
import * as express from "express";
import * as Schema from "../data/sql/schema";
import {ErrorCode, HttpStatus, Utils} from "../libs";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_CONTRACT} from "../libs/constants";


export class ContractService extends BaseService<ContractModel, typeof ContractRepository> {
    constructor() {
        super(ContractRepository);
    }

    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<ContractModel>> {
        let orderBy = params.orderBy ? params.orderBy : Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE;
        let orderType = params.orderType ? params.orderType : "ASC";
        let startDate = params.startDate || null;
        try {
            if (startDate) {
                startDate = Utils.dateByFormat(startDate);
            }
        } catch (error) {
            return Promise.reject(error);
        }
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (params.status) {
                    q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.STATUS, params.status);
                }
                if (params.id) {
                    q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.ID, params.id);
                }
                if (params.condoId) {
                    q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONDO_ID, params.condoId);
                }
                if (params.key) {
                    q.where(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TYPE, "ILIKE", `%${params.key}%`);
                    q.orWhere(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.VENDOR_NAME, "ILIKE", `%${params.key}%`);
                }
                if (params.startDate) {
                    q.andWhere(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE, ">=", params.startDate);
                }
                // if (params.endDate) {
                //     q.andWhere(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE, "<", params.endDate);
                // }
                if (offset) {
                    q.offset(offset);
                }
                if (limit) {
                    q.limit(limit);
                }
                if (isOrderBy) {
                    q.orderBy(orderBy, orderType);
                }
            };
        };
        return ContractRepository.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    public archive(id): Promise<string> {
        if (!id) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let contract = new ContractModel();
        contract.id = id;
        contract.status = STATUS_CONTRACT.ARCHIVED;

        return ContractRepository.update(contract)
        .then(contractDto => {
            return id;
        });
    }
}

export default ContractService;
