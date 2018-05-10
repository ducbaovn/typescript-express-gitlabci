/**
 * Created by ducbaovn on 06/06/17.
 */

import {BaseRepository} from "./base.repository";
import {CondoNameDto} from "./sql/models";
import {CondoNameModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class CondoNameRepository extends BaseRepository<CondoNameDto, CondoNameModel> {
    constructor() {
        super(CondoNameDto, CondoNameModel, {
            fromDto: CondoNameModel.fromDto,
            toDto: CondoNameModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<CondoNameModel>> {
        let keyword = searchParams.key || null;
        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q) => {
                q.where(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (keyword !== null) {
                    q.where(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME, "ILIKE", `%${keyword}%`);
                }
                if (searchParams.id) {
                    q.where(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.ID, searchParams.id);
                }
                if (searchParams.name) {
                    q.where(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME, searchParams.name);
                }
                if (limit !== null) {
                    q.limit(limit);
                }
                if (offset !== null) {
                    q.offset(offset);
                }
                if (isOrderBy) {
                    q.orderByRaw(`lower(${Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME}) ASC`);
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default CondoNameRepository;
