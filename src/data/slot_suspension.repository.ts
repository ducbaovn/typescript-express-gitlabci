import { BaseRepository } from "./base.repository";
import { SuspendDto } from "./sql/models";
import { SlotSuspensionModel, CollectionWrap } from "../models";
import { SLOT_SUSPENSION_TABLE_SCHEMA, FACILITIES_TABLE_SCHEMA, SLOT_TABLE_SCHEMA } from "../data/sql/schema";
import * as Bluebird from "bluebird";
import { } from "../libs/constants";
import * as momentTz from "moment-timezone";
import { QueryBuilder } from "knex";

export class SlotSuspensionRepository extends BaseRepository<SuspendDto, SlotSuspensionModel> {
    constructor() {
        super(SuspendDto, SlotSuspensionModel, {
            fromDto: SlotSuspensionModel.fromDto,
            toDto: SlotSuspensionModel.toDto,
        });
    }

    public search(params: any = {}, offset?: number, limit?: number, related = [], filters = []): Bluebird<CollectionWrap<SlotSuspensionModel>> {
        limit = limit && limit > 0 ? limit : null;
        offset = offset && offset > 0 ? offset : null;

        let queryBuilder = (q: QueryBuilder, offset?: number, limit?: number, isOrder?: boolean): QueryBuilder => {
            q.select(`${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME}.*`);

            q.innerJoin(SLOT_TABLE_SCHEMA.TABLE_NAME,
                `${SLOT_TABLE_SCHEMA.TABLE_NAME}.${SLOT_TABLE_SCHEMA.FIELDS.ID}`,
                `${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME}.${SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.SLOT_ID}`,
            );
            q.innerJoin(FACILITIES_TABLE_SCHEMA.TABLE_NAME,
                `${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.ID}`,
                `${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME}.${SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.FACILITY_ID}`,
            );

            q.andWhere(`${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME}.${SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.END_TIME}`, ">", new Date().toISOString());

            if (params.name != null && params.name !== "") {
                q.where(`${SLOT_TABLE_SCHEMA.TABLE_NAME}.${SLOT_TABLE_SCHEMA.FIELDS.NAME}`, "like", `%${params.name}%`);
                q.orWhere(`${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.NAME}`, "like", `%${params.name}%`);
            }

            if (params.condoId != null) {
                q.where(`${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.CONDO_ID}`, params.condoId);
            }

            q.groupBy(
                `${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME}.${SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.ID}`,
                `${SLOT_TABLE_SCHEMA.TABLE_NAME}.${SLOT_TABLE_SCHEMA.FIELDS.ID}`,
                `${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.NAME}`
            );
            if (offset != null) {
                q.offset(offset);
            }
            if (limit != null) {
                q.limit(limit);
            }
            if (isOrder) {
                q.orderBy(`${FACILITIES_TABLE_SCHEMA.TABLE_NAME}.${FACILITIES_TABLE_SCHEMA.FIELDS.NAME}`, "DESC");
            }

            q.debug(true);
            console.log(q.toQuery());
            return q;
        };

        let ret = new CollectionWrap<SlotSuspensionModel>();

        return Bluebird.resolve()
            .then(() => {
                return SuspendDto.knex().raw(`select count(*) from ( ${queryBuilder(SuspendDto.knex().table(SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME))}) as temp`);
            })
            .then((object) => {
                if (object != null && object.rowCount > 0 && object.rows[0].count != null) {
                    ret.total = object.rows[0].count;
                }
                return this.findByQuery(q => queryBuilder(q, offset, limit, true), related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                return ret;
            });
    }

    public getSuspensionByDuration(slotIds: string[], startDate: momentTz.Moment, endDate: momentTz.Moment): Bluebird<SlotSuspensionModel[]> {
        return this.findByQuery((q) => {
            if (slotIds != null) {
                q.whereIn(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.SLOT_ID, slotIds);
            }

            q.where(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.START_TIME, "<", endDate.toISOString());
            q.andWhere(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.END_TIME, ">", startDate.toISOString());
            q.andWhere(SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
        });
    }
}

export default SlotSuspensionRepository;
