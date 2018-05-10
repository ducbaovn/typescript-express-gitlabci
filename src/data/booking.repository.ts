import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import { BaseRepository } from "./base.repository";
import { BookingDto } from "./sql/models";
import { BookingModel, CollectionWrap } from "../models";
import { TIME_ZONE, PAYMENT_STATUS } from "../libs/constants";
import { QueryBuilder } from "knex";
import {
    BOOKING_TABLE_SCHEMA,
    USER_TABLE_SCHEMA,
    BOOKING_ITEM_TABLE_SCHEMA,
    SLOT_TABLE_SCHEMA,
    BLOCK_TABLE_SCHEMA,
    UNIT_TABLE_SCHEMA,
    FACILITIES_TABLE_SCHEMA
} from "./sql/schema";
import { Utils } from "../libs";
import { DEPOSIT_STATUS } from "../libs/constants";

export class BookingRepository extends BaseRepository<BookingDto, BookingModel> {
    constructor() {
        super(BookingDto, BookingModel, {
            fromDto: BookingModel.fromDto,
            toDto: BookingModel.toDto,
        });
    }

    /**
     * get list booking
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<BookingModel>>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<BookingModel>> {
        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let blockId = searchParams.blockId || null;
        let floorId = searchParams.floorId || null;
        let unitId = searchParams.unitId || null;
        let userId = searchParams.userId || null;
        let slotId = searchParams.slotId || null;
        let depositStatus = searchParams.depositStatus || null;
        let paymentStatus = searchParams.paymentStatus || null;
        let activeBooking = searchParams.activeBooking || null;
        let orderType = searchParams.orderType || "DESC";
        let eventStartDateStart;
        let eventStartDateEnd;
        let notPaymentStatus = searchParams.notPaymentStatus || null;

        let firstName = searchParams.firstName || null;
        let lastName = searchParams.lastName || null;
        let unitNumber = searchParams.unitNumber || null;
        let facilityId = searchParams.facilityId || null;
        let timezone = searchParams.timezone || null;
        let eventDate;

        let isEnable = searchParams.isEnable || null;

        try {
            eventStartDateStart = searchParams.eventStartDateStart ? Utils.dateByFormat(searchParams.eventStartDateStart) : null;
            eventStartDateEnd = searchParams.eventStartDateEnd ? Utils.dateByFormat(searchParams.eventStartDateEnd) : null;
            eventDate = searchParams.eventDate ? Utils.dateByFormat(searchParams.eventDate) : null;
        } catch (error) {
            return Promise.reject(error);
        }
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                let currentDate = new Date().toISOString();

                q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);

                if (isEnable != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, isEnable);
                }

                q.innerJoin(USER_TABLE_SCHEMA.TABLE_NAME,
                    `${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.ID}`,
                    `${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.USER_ID}`);

                if (keyword != null) {
                    q.where(q1 => {
                        q1.where(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}`, "ILIKE", `%${keyword}%`);
                    });
                }

                if (condoId != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }

                if (blockId != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.BLOCK_ID}`, blockId);
                }

                if (floorId != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.FLOOR_ID}`, floorId);
                }

                if (unitId != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID}`, unitId);
                }

                if (userId != null) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.USER_ID}`, userId);
                }

                if (depositStatus != null) {
                    q.whereIn(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS}`, depositStatus);
                }

                if (paymentStatus != null) {
                    q.whereIn(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS}`, paymentStatus);
                }

                if (notPaymentStatus != null) {
                    q.whereNotIn(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS}`, notPaymentStatus);
                }

                if (slotId != null) {
                    q.innerJoin(BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME,
                        `${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID}`,
                        `${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.ID}`);

                    q.innerJoin(SLOT_TABLE_SCHEMA.TABLE_NAME,
                        `${SLOT_TABLE_SCHEMA.TABLE_NAME}.${SLOT_TABLE_SCHEMA.FIELDS.ID}`,
                        `${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID}`);

                    q.where(`${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID}`, slotId);
                }

                if (activeBooking != null) {
                    if (activeBooking === "1") {    // filter for tab active booking on portal
                        q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, ">=", currentDate);
                    } else {
                        q.where(q1 => {
                            q1.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, "<", currentDate);
                            q1.orWhere(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS}`, PAYMENT_STATUS.CANCELLED);
                        });
                    }
                }

                if (eventStartDateStart) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, ">=", eventStartDateStart);
                }

                if (eventStartDateEnd) {
                    q.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, "<", eventStartDateEnd);
                }

                if (firstName != null) {
                    q.where(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${firstName}%`);
                }

                if (lastName != null) {
                    q.where(`${USER_TABLE_SCHEMA.TABLE_NAME}.${USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${lastName}%`);
                }

                if (unitNumber != null) {
                    q.innerJoin(UNIT_TABLE_SCHEMA.TABLE_NAME,
                        `${UNIT_TABLE_SCHEMA.TABLE_NAME}.${UNIT_TABLE_SCHEMA.FIELDS.ID}`,
                        `${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID}`);

                    q.where(`${UNIT_TABLE_SCHEMA.TABLE_NAME}.${UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`, "ILIKE", `%${unitNumber}%`);
                }

                if (eventDate) {
                    if (!timezone) {
                        timezone = TIME_ZONE.TIME_ZONE_DEFAULT;
                    }
                    q.whereRaw(`date_trunc('day', ${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE} at time zone '${timezone}') = to_date('${eventDate}','YYYY-MM-DD')`);
                }

                if (facilityId != null) {
                    if (slotId === null) {
                        q.innerJoin(BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME,
                            `${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID}`,
                            `${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.ID}`);
                    }
                    q.innerJoin(FACILITIES_TABLE_SCHEMA.TABLE_NAME,
                        `${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.ID}`,
                        `${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_ID}`);

                    q.where(`${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_ID}`, facilityId);
                }

                if (isOrder) {
                    q.orderBy(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, orderType);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }
            };
        };

        let ret = new CollectionWrap<BookingModel>();

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    /**
     * Function update the payment status of booking item.
     *
     * @param booking
     * @param paymentStatus
     * @returns {Promise<BookingDto>}
     */
    public updatePaymentStatus(booking: BookingModel, paymentStatus: string): Promise<any> {
        booking.paymentStatus = paymentStatus;

        return this.update(booking);
    }

    public countDueDepositStatusByCondo() {
        let query = `SELECT ${BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID}, COUNT(*) duecount
                    FROM ${BOOKING_TABLE_SCHEMA.TABLE_NAME}
                    WHERE ${BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS} = '${DEPOSIT_STATUS.DUE}'
                    GROUP BY ${BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID};`;
        return this.rawQuery(query);
    }
}
export default BookingRepository;
