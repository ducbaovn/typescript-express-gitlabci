import { SlotDto, SlotDurationTypeDto, SlotRestrictionTypeDto, SlotTypeDto } from "./sql/models";
import { CollectionWrap, SlotModel, SlotDurationTypeModel, SlotRestrictionTypeModel, SlotTypeModel } from "../models";
import { BaseRepository } from "./base.repository";
import * as Bluebird from "bluebird";
import { QueryBuilder } from "knex";
import { FACILITIES_TABLE_SCHEMA, SLOT_SUSPENSION_TABLE_SCHEMA, SLOT_TABLE_SCHEMA } from "./sql/schema";
import { DELETE_STATUS, ENABLE_STATUS } from "../libs/constants";

export class SlotRepository extends BaseRepository<SlotDto, SlotModel> {
    constructor() {
        super(SlotDto, SlotModel, {
            fromDto: SlotModel.fromDto,
            toDto: SlotModel.toDto,
        });
    }

    public getTypes(): Bluebird<CollectionWrap<SlotTypeModel>> {
        return Bluebird.resolve()
            .then(() => {
                return new SlotTypeDto().fetchAll();
            })
            .then((objects) => {
                let ret: CollectionWrap<SlotTypeModel> = new CollectionWrap<SlotTypeModel>();
                if (objects != null) {
                    ret.total = objects.length;
                    objects.forEach(object => {
                        ret.data.push(SlotTypeModel.fromDto(object));
                    });
                }
                return ret;
            });
    }

    public getDurationTypes(): Bluebird<CollectionWrap<SlotDurationTypeModel>> {
        return Bluebird.resolve()
            .then(() => {
                return new SlotDurationTypeDto().fetchAll();
            })
            .then((objects) => {
                let ret: CollectionWrap<SlotDurationTypeModel> = new CollectionWrap<SlotDurationTypeModel>();
                if (objects != null) {
                    ret.total = objects.length;
                    objects.forEach(object => {
                        ret.data.push(SlotDurationTypeModel.fromDto(object));
                    });
                }
                return ret;
            });
    }

    public getRestrictionTypes(): Bluebird<CollectionWrap<SlotRestrictionTypeModel>> {
        return Bluebird.resolve()
            .then(() => {
                return new SlotRestrictionTypeDto().fetchAll();
            })
            .then((objects) => {
                let ret: CollectionWrap<SlotRestrictionTypeModel> = new CollectionWrap<SlotRestrictionTypeModel>();
                if (objects != null) {
                    ret.total = objects.length;
                    objects.forEach(object => {
                        ret.data.push(SlotRestrictionTypeModel.fromDto(object));
                    });
                }
                return ret;
            });
    }

    public search(params: any = {}, related: string[] = [], filters: string[] = []): Bluebird<CollectionWrap<SlotModel>> {
        let limit = params.limit || null;
        let offset = params.offset || null;

        let query = (offset?: number, limit?: number, isOrderBy: boolean = false) => {
            return (q: QueryBuilder): void => {
                q.where(SLOT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(SLOT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);

                if (params.facilityId != null) {
                    q.where(SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID, params.facilityId);
                }

                if (params.name != null && params.name !== "") {
                    q.where(SLOT_TABLE_SCHEMA.FIELDS.NAME, "like", `%${params.name}%`);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrderBy) {
                    q.orderBy(SLOT_TABLE_SCHEMA.FIELDS.NAME, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<SlotModel>();
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

export default SlotRepository;
