/**
 * Created by ducbaovn on 04/12/17.
 */

import * as Promise from "bluebird";
import {BaseRepository} from "./base.repository";
import {FunctionPasswordDto} from "./sql/models";
import {FunctionPasswordModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class FunctionPasswordRepository extends BaseRepository<FunctionPasswordDto, FunctionPasswordModel> {
    constructor() {
        super(FunctionPasswordDto, FunctionPasswordModel, {
            fromDto: FunctionPasswordModel.fromDto,
            toDto: FunctionPasswordModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<FunctionPasswordModel>> {
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (searchParams.condoId) {
                    q.where(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID, searchParams.condoId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default FunctionPasswordRepository;
