import * as Promise from "bluebird";
import {QueryBuilder} from "knex";
import {BaseRepository} from "./base.repository";
import {TransactionHistoryDto} from "./sql/models";
import {TransactionHistoryModel} from "../models";
import {CollectionWrap} from "../models/collections";
import {
    TRANSACTION_HISTORY_TABLE_SCHEMA,
    USER_TABLE_SCHEMA
}from "./sql/schema";

export class TransactionHistoryRepository extends BaseRepository<TransactionHistoryDto, TransactionHistoryModel> {
    constructor() {
        super(TransactionHistoryDto, TransactionHistoryModel, {
            fromDto: TransactionHistoryModel.fromDto,
            toDto: TransactionHistoryModel.toDto,
        });
    }

    /**
     * Get list transaction history by query: condo, user, transaction date, item type (BookFacility, OnlineForm)
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<TransactionHistoryModel>>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<TransactionHistoryModel>> {
        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let userId = searchParams.userId || null;
        let type = searchParams.type || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                q.innerJoin(USER_TABLE_SCHEMA.TABLE_NAME,
                    `${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.ID}`,
                    `${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.USER_ID}`);

                // q.innerJoin(CONDO_TABLE_SCHEMA.TABLE_NAME,
                //     `${CONDO_TABLE_SCHEMA.TABLE_NAME}.${CONDO_TABLE_SCHEMA.FIELDS.ID}`,
                //     `${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID}`);

                if (keyword != null) {
                    q.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.EMAIL}`, "ILIKE", `%${keyword}%`);
                    q.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                    q.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                    q.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}`, "ILIKE", `%${keyword}%`);
                }

                if (condoId != null) {
                    q.andWhere(`${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                if (userId != null) {
                    q.andWhere(`${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }

                if (type != null) {
                    q.andWhere(`${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_TYPE}`, type);
                }

                if (isOrder) {
                    q.orderBy(`${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE}`, "DESC");
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }
            };
        };

        let ret = new CollectionWrap<TransactionHistoryModel>();

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

export default TransactionHistoryRepository;
