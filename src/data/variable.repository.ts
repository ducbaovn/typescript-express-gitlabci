/**
 * Created by davidho on 2/12/17.
 */
import { VariableDto } from "./sql/models";
import { BaseRepository } from "./base.repository";
import { VariableModel } from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import { CollectionWrap } from "../models/collections";
import { DELETE_STATUS } from "../libs/constants";
import { VARIABLE_TABLE_SCHEMA } from "./sql/schema";

export class VariableRepository extends BaseRepository<VariableDto, VariableModel> {
    constructor() {
        super(VariableDto, VariableModel, {
            fromDto: VariableModel.fromDto,
            toDto: VariableModel.toDto,
        });
    }

    /**
     * search Variable
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<VariableModel>> {
        let keyword = searchParams.key || null;
        let key = searchParams.key || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (key != null) {
                    q.where(Schema.VARIABLE_TABLE_SCHEMA.FIELDS.KEY, "ILIKE", `%${keyword}%`);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrder != null) {
                        q.orderBy(Schema.VARIABLE_TABLE_SCHEMA.FIELDS.CREATED_DATE, "DESC");
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

}
export default VariableRepository;
