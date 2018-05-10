import { CollectionWrap, SlotTimeModel } from "../models";
import { BaseRepository } from "./base.repository";
import { SlotTimeDto } from "./sql/models";
import { SLOT_TIME_TABLE_SCHEMA } from "./sql/schema";
import * as Bluebird from "bluebird";
import { QueryBuilder } from "knex";
import { SlotDurationRepository, SlotTimeItemRepository } from "./index";
import { Logger } from "../libs/index";

export class SlotTimeRepository extends BaseRepository<SlotTimeDto, SlotTimeModel> {
    constructor() {
        super(SlotTimeDto, SlotTimeModel, {
            fromDto: SlotTimeModel.fromDto,
            toDto: SlotTimeModel.toDto,
        });
    }

    public search(params: any = {}, related: string[] = [], filters: string[] = []): Bluebird<CollectionWrap<SlotTimeModel>> {
        let limit = params.limit || null;
        let offset = params.offset || null;

        let query = (offset?: number, limit?: number) => {
            return (q: QueryBuilder): void => {
                if (params.facilityId != null) {
                    q.where(SLOT_TIME_TABLE_SCHEMA.FIELDS.FACILITY_ID, params.facilityId);
                }

                if (params.isoWeekday != null) {
                    q.where(SLOT_TIME_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY, params.isoWeekday);
                }

                if (params.slotIds != null && params.slotIds.length > 0) {
                    q.whereIn(SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID, params.slotIds);
                }

                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
            };
        };

        let ret = new CollectionWrap<SlotTimeModel>();
        return this.countByQuery(query())
            .then((total) => {
                ret.total = total;
                return this.findByQuery(query(offset, limit), related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                return ret;
            });
    }

    /**
     * Function save all time item and durations for slot.
     *
     * @param dataModel
     * @returns {Bluebird<U>}
     */
    public saveTimesForSlot(dataModel: SlotTimeModel): Bluebird<SlotTimeModel> {
        return Bluebird.resolve()
            .then(() => {
                return this.insertGet(dataModel);
            })
            .tap((object) => {
                // Save slot time items.
                if (dataModel.timeItems != null && dataModel.timeItems.length > 0) {
                    return Bluebird.each(dataModel.timeItems, item => {
                        item.slotTimeId = object.id;

                        if (item.id != null && item.id !== "") {
                            // Update time item with start/finish time.
                            return SlotTimeItemRepository.update(item);
                        } else {
                            return SlotTimeItemRepository.insert(item);
                        }
                    });
                }
            })
            .tap((object) => {
                // Save list durations.
                if (dataModel.durations != null && dataModel.durations.length > 0) {
                    // Remove old duration before insert new list. Notes, make sure saved all data after booking factility.
                    return SlotDurationRepository.deleteDurationsBySlotTime(object.id)
                        .then(() => {
                            return Bluebird.each(dataModel.durations, item => {
                                item.slotTimeId = object.id;

                                return SlotDurationRepository.insert(item);
                            });
                        });
                }
            });
    }
}

export default SlotTimeRepository;
