/**
 * Created by davidho on 2/18/17.
 */

import {BaseRepository} from "./base.repository";
import {CondoRulesDto} from "./sql/models";
import {CondoRulesModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, SORT_FIELDS} from "../libs/constants";
export class CondoRulesRepository extends BaseRepository<CondoRulesDto, CondoRulesModel> {
    constructor() {
        super(CondoRulesDto, CondoRulesModel, {
            fromDto: CondoRulesModel.fromDto,
            toDto: CondoRulesModel.toDto,
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
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<CondoRulesModel>> {
        let keyword = searchParams.key || null;
        let condoId = searchParams.condoId || null;
        let sortBy = searchParams.sortBy;
        let sortType = searchParams.sortType;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.TITLE, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId != null) {
                    q.andWhere(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }

                q.where(Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    switch (sortBy) {
                        case SORT_FIELDS.CONDO_RULE.DATE_POST: {
                            sortBy = Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.DATE_POST;
                        }
                            break;
                        case SORT_FIELDS.CONDO_RULE.TITLE: {
                            sortBy = Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.TITLE;
                        }
                            break;
                        default: {
                            sortBy = Schema.CONDO_RULES_TABLE_SCHEMA.FIELDS.TITLE;
                            break;
                        }
                    }

                    q.orderBy(sortBy, sortType);
                }
            };
        };

        let ret = new CollectionWrap<CondoRulesModel>();
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
export  default CondoRulesRepository;
