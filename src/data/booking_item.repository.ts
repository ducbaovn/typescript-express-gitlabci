import * as Bluebird from "bluebird";
import {QueryBuilder} from "knex";
import * as momentTz from "moment-timezone";
import {BaseRepository} from "./base.repository";
import {BookingItemDto} from "./sql/models";
import {BookingItemModel, CollectionWrap} from "../models";
import {BOOKING_ITEM_TABLE_SCHEMA} from "../data/sql/schema";
import {DELETE_STATUS} from "../libs/constants";

export class BookingItemRepository extends BaseRepository<BookingItemDto, BookingItemModel> {
    constructor() {
        super(BookingItemDto, BookingItemModel, {
            fromDto: BookingItemModel.fromDto,
            toDto: BookingItemModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Bluebird<CollectionWrap<BookingItemModel>> {
        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
            };
        };

        let ret = new CollectionWrap<BookingItemModel>();
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
     * Function get booking item by duration time (start - end date).
     *
     * @param facilityId
     * @param slotId
     * @param startDate
     * @param endDate
     * @returns {Promise<BookingItemModel[]>}
     */
    public getBookingItemByDuration(slotIds: string[], startDate: momentTz.Moment, endDate: momentTz.Moment, bookingId: string): Bluebird<BookingItemModel[]> {
        return this.findByQuery((q) => {
            if (bookingId) {
                q.whereNot(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID, bookingId);
            }

            if (slotIds != null) {
                q.whereIn(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID, slotIds);
            }

            q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_START_DATE, "<", endDate.toISOString());
            q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE, ">", startDate.toISOString());
            q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }
}
export default BookingItemRepository;
