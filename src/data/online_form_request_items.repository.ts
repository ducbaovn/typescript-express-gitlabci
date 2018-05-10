/**
 * Created by davidho on 3/1/17.
 */

import {BaseRepository} from "./base.repository";
import {OnlineFormRequestItemsDto} from "./sql/models";
import {OnlineFormRequestItemsModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, ONLINE_FORM_REQUEST_ITEM_STATUS} from "../libs/constants";

export class OnlineFormRequestItemsRepository extends BaseRepository<OnlineFormRequestItemsDto, OnlineFormRequestItemsModel> {
    constructor() {
        super(OnlineFormRequestItemsDto, OnlineFormRequestItemsModel, {
            fromDto: OnlineFormRequestItemsModel.fromDto,
            toDto: OnlineFormRequestItemsModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<OnlineFormRequestItemsModel>> {
        let keyword = searchParams.key || null;
        let isNew = searchParams.isNew || null;
        let condoId = searchParams.condoId || null;
        let unitId = searchParams.unitId || null;
        let type = searchParams.type || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q): void => {
                q.where(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);

                if (isNew !== null) {
                    if (parseInt(isNew) === 1) {
                        q.whereIn(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.STATUS}`, [ONLINE_FORM_REQUEST_ITEM_STATUS.NEW, ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED]);
                    } else {
                        q.whereIn(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.STATUS}`, [ONLINE_FORM_REQUEST_ITEM_STATUS.RESOLVED, ONLINE_FORM_REQUEST_ITEM_STATUS.ARCHIVED]);
                    }
                }

                if (keyword !== null) { // join user where first name and last name
                    q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME,
                        `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`,
                        Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.USER_ID);
                    q.innerJoin(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME,
                        `${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}`,
                        Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UNIT_ID);
                    q.where(q1 => {
                        q1.where(Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.VEHICLE_NUMBER, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IU_NUMBER, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.SERIAL_NUMBER, "ILIKE", `%${keyword}%`);
                        q1.orWhere(Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER, "ILIKE", `%${keyword}%`);
                    });
                }
                if (type !== null) {
                    q.innerJoin(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME,
                        `${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`,
                        Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID);
                    q.innerJoin(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME,
                            `${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`,
                            Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID);
                    q.where(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID, type);
                }

                if (condoId !== null) {
                    q.andWhere(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CONDO_ID}` , condoId);
                }
                if (unitId !== null) {
                    q.andWhere(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UNIT_ID}` , unitId);
                }

                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "DESC");
                }

            };
        };

        let ret = new CollectionWrap<OnlineFormRequestItemsModel>();

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

    /**
     * Update payment status for online form.
     *
     * @param formModel
     * @param transactionId
     * @param paymentStatus
     * @returns {Promise<OnlineFormRequestDto>}
     */
    public updateStatus(formModel: OnlineFormRequestItemsModel, transactionId: string, status: string): Promise<any> {
        formModel.status = status;
        formModel.transactionId = transactionId;
        return this.update(formModel);
    }

    public countOnlineFormStatusByCondo() {
        let query = `SELECT COUNT(item.*) duecount
                    FROM ${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} item
                    WHERE item.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_DELETED} = ${DELETE_STATUS.NO}
                        AND item.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_ENABLE} = ${ENABLE_STATUS.NO}
                    GROUP BY item.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CONDO_ID};`;
        return this.rawQuery(query);
    }
}
export  default OnlineFormRequestItemsRepository;
