/**
 * Created by ducbaovn on 05/05/17.
 */

import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { GetQuotationServiceModel, CollectionWrap } from "../models";
import { GetQuotationServiceRepository } from "../data";
import * as express from "express";
import * as Schema from "../data/sql/schema";
import { ErrorCode, HttpStatus } from "../libs/index";
import { DELETE_STATUS, ENABLE_STATUS } from "../libs/constants";

export class GetQuotationService extends BaseService<GetQuotationServiceModel, typeof GetQuotationServiceRepository> {
    constructor() {
        super(GetQuotationServiceRepository);
    }

    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<GetQuotationServiceModel>> {
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (params.id) {
                    q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID, params.id);
                }
                if (params.subcategoryId) {
                    q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID, params.subcategoryId);
                }
                if (params.advertiserId) {
                    q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID, params.advertiserId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                }
            };
        };
        return GetQuotationServiceRepository.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}

export default GetQuotationService;
