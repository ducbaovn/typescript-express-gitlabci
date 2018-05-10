/**
 * Created by davidho on 2/20/17.
 */

import {BaseRepository} from "./base.repository";
import {CouncilMinutesDto} from "./sql/models";
import {CouncilMinutesModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, SORT_FIELDS} from "../libs/constants";

export class CouncilMinutesRepository extends BaseRepository<CouncilMinutesDto, CouncilMinutesModel> {
    constructor() {
        super(CouncilMinutesDto, CouncilMinutesModel, {
            fromDto: CouncilMinutesModel.fromDto,
            toDto: CouncilMinutesModel.toDto,
        });
    }

    /**
     * search Announcement
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<CouncilMinutesModel>> {
        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let sortBy = searchParams.sortBy || Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.DATE_POST;
        let sortType = searchParams.sortType || "DESC";

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.TITLE, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId != null) {
                    q.andWhere(Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }

                q.where(Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    switch (sortBy) {
                        case SORT_FIELDS.COUNCIL_MINUTES.DATE_POST: {
                            sortBy = Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.DATE_POST;
                        }
                            break;
                        case SORT_FIELDS.COUNCIL_MINUTES.TITLE: {
                            sortBy = Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.TITLE;
                        }
                            break;
                        default:
                            sortBy = Schema.COUNCIL_MINUTES_TABLE_SCHEMA.FIELDS.DATE_POST;
                            break;
                    }
                    q.orderBy(sortBy, sortType);
                }

            };
        };

        let ret = new CollectionWrap<CouncilMinutesModel>();
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
export  default CouncilMinutesRepository;
