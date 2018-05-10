/**
 * Created by davidho on 1/22/17.
 */

import {BaseRepository} from "./base.repository";
import {TodoDto} from "./sql/models";
import {TodoModel, ExceptionModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {ENABLE_STATUS, DELETE_STATUS} from "../libs/constants";

export class TodoRepository extends BaseRepository<TodoDto, TodoModel> {
    constructor() {
        super(TodoDto, TodoModel, {
            fromDto: TodoModel.fromDto,
            toDto: TodoModel.toDto,
        });
    }


    /**
     * search User
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<TodoModel>> {
        let userId = searchParams.userId || null;
        let condoId = searchParams.condoId || null;
        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(`${Schema.TODO_SCHEMA.TABLE_NAME}.${Schema.TODO_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                // q.where(`${Schema.TODO_SCHEMA.TABLE_NAME}.${Schema.TODO_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
                if (condoId != null) {
                    q.where(`${Schema.TODO_SCHEMA.TABLE_NAME}.${Schema.TODO_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }
                if (userId != null) {
                    q.where(`${Schema.TODO_SCHEMA.TABLE_NAME}.${Schema.TODO_SCHEMA.FIELDS.USER_ID}`, userId);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(`${Schema.TODO_SCHEMA.TABLE_NAME}.${Schema.TODO_SCHEMA.FIELDS.CREATED_DATE}`, "DESC");
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

}
export  default TodoRepository;
