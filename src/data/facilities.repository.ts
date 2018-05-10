import { FacilityDto, FacilityTypeDto } from "./sql/models";
import { CollectionWrap, FacilityModel, FacilityTypeModel } from "../models";
import { BaseRepository } from "./base.repository";
import { FACILITIES_TABLE_SCHEMA, SLOT_SUSPENSION_TABLE_SCHEMA } from "../data/sql/schema";
import * as Bluebird from "bluebird";
import { QueryBuilder } from "knex";
import { DELETE_STATUS, ENABLE_STATUS } from "../libs/constants";
export class FacilityRepository extends BaseRepository<FacilityDto, FacilityModel> {
    constructor() {
        super(FacilityDto, FacilityModel, {
            fromDto: FacilityModel.fromDto,
            toDto: FacilityModel.toDto,
        });
    }

    public getTypes(): Bluebird<CollectionWrap<FacilityTypeModel>> {
        return Bluebird.resolve()
            .then(() => {
                return new FacilityTypeDto().fetchAll();
            })
            .then((objects) => {
                let ret: CollectionWrap<FacilityTypeModel> = new CollectionWrap<FacilityTypeModel>();
                if (objects != null) {
                    ret.total = objects.length;
                    objects.forEach(object => {
                        ret.data.push(FacilityTypeModel.fromDto(object));
                    });
                }
                return ret;
            });
    }

    public search(params: any = {}, offset?: number, limit?: number, related = [], filters = []): Bluebird<CollectionWrap<FacilityModel>> {
        limit = limit && limit > 0 ? limit : null;
        offset = offset && offset > 0 ? offset : null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                q.where(FACILITIES_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                if (!params.isAdmin) {
                    q.where(FACILITIES_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                }

                if (params.condoId != null) {
                    q.where(FACILITIES_TABLE_SCHEMA.FIELDS.CONDO_ID, params.condoId);
                }

                if (params.name != null && params.name !== "") {
                    q.where(FACILITIES_TABLE_SCHEMA.FIELDS.NAME, "like", `%${params.name}%`);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder) {
                    q.orderByRaw(`lower(${FACILITIES_TABLE_SCHEMA.FIELDS.NAME}) ASC`);
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}

export default FacilityRepository;
