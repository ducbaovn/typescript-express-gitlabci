import {SlotDurationDto} from "./sql/models";
import {SLOT_DURATION_TABLE_SCHEMA} from "./sql/schema";
import {CollectionWrap, SlotDurationModel} from "../models";
import {BaseRepository} from "./base.repository";
import {QueryBuilder} from "knex";
import * as Bluebird from "bluebird";

export class SlotDurationRepository extends BaseRepository<SlotDurationDto, SlotDurationModel> {
    constructor() {
        super(SlotDurationDto, SlotDurationModel, {
            fromDto: SlotDurationModel.fromDto,
            toDto: SlotDurationModel.toDto,
        });
    }

    public search(params: any = {}, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Bluebird<CollectionWrap<SlotDurationModel>> {
        limit = limit && limit > 0 ? limit : null;
        offset = offset && offset > 0 ? offset : null;

        let query = (offset?: number, limit?: number) => {
            return (q: QueryBuilder): void => {
                if (params.facilityId != null) {
                    q.where(SLOT_DURATION_TABLE_SCHEMA.FIELDS.FACILITY_ID, params.facilityId);
                }
                if (params.startTime != null) {
                    q.where(SLOT_DURATION_TABLE_SCHEMA.FIELDS.START_TIME, "=", params.startTime);
                }
                if (params.stopTime != null) {
                    q.where(SLOT_DURATION_TABLE_SCHEMA.FIELDS.END_TIME, "=", params.stopTime);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
            };
        };

        let ret = new CollectionWrap<SlotDurationModel>();
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
     * Function delete all durations by slot time.
     *
     * @param slotTimeId
     * @returns {Promise<any[]>}
     */
    public deleteDurationsBySlotTime(slotTimeId: string): Bluebird<any> {
        return this.deleteByQuery(q => {
            q.where(SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID, slotTimeId);
        });
    }
}

export default SlotDurationRepository;
