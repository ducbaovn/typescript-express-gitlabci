/**
 * Created by davidho on 2/6/17.
 */

import {BaseRepository} from "./base.repository";
import {LatestTransactionDto} from "./sql/models";
import {LatestTransactionModel} from "../models";
import {CollectionWrap} from "../models/collections";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS} from "../libs/constants";
export class LatestTransactionRepository extends BaseRepository<LatestTransactionDto, LatestTransactionModel> {
    constructor() {
        super(LatestTransactionDto, LatestTransactionModel, {
            fromDto: LatestTransactionModel.fromDto,
            toDto: LatestTransactionModel.toDto,
        });
    }

    /**
     * search Latest transaction
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<LatestTransactionModel>> {
        let keyword = searchParams.key || null;
        let type = searchParams.type || null;
        let condoId = searchParams.condoId || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.BLOCK, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UNIT_NUMBER, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.SIZE, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId != null) {
                    q.andWhere(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }
                if (type != null) {
                    q.andWhere(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE, type);
                }
                q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrder != null) {
                    q.orderBy(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE, "DESC");
                }

            };
        };

        let ret = new CollectionWrap<LatestTransactionModel>();
        return this.countByQuery(query())
            .then((total) => {
                ret.total = total;
                return this.findByQuery(query(offset, limit, true), related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                return ret;
            });
    }

}
export  default LatestTransactionRepository;
