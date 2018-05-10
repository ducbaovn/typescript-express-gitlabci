/**
 * Created by kiettv on 12/26/16.
 */
import { ErrorCode, HttpStatus, Logger } from "../libs";
import { BaseModel, CollectionWrap, ExceptionModel } from "../models";
import { BaseDto } from "./sql/models";
import * as Promise from "bluebird";
import { QueryBuilder } from "knex";
import * as _ from "lodash";
import * as Knex from "knex";
import { WithRelatedQuery } from "bookshelf";
export class BaseRepository<T extends BaseDto<T>, X extends BaseModel> {
    constructor(protected dto: { new (attributes?: any, isNew?: boolean): T },
        protected model: { new (): X },
        protected converter: {
            toDto: (data: X) => any,
            fromDto: (data: any, filter: string[]) => X,
        }) {
    }

    public update(data: X): Promise<T> {
        if (data == null && data.id != null && data.id !== "") {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let ins = this.converter.toDto(data);
        return new this.dto({ id: ins.id }).save(ins, {
            patch: true
        });
    }

    public insert(data: X): Promise<T> {
        if (data == null) {
            return Promise.resolve(null);
        }
        let ins = this.converter.toDto(data);
        return new this.dto().save(ins);
    }

    /**
     * Function insert and convert to model object with related and filters.
     *
     * @param data
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public insertGet(data: X, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X> {
        return this.insert(data)
            .then(result => {
                return this.findOne(result.id, related, filters);
            });
    }

    public forceDelete(id: string): Promise<boolean> {
        if (id == null) {
            return Promise.resolve(false);
        }
        return new this.dto({ id: id }).destroy()
            .then(() => {
                return true;
            })
            .catch(err => {
                Logger.error(err.message, err);
                return false;
            });
    }
    public deleteLogic(id: string): Promise<T> {
        if (id == null || id.length === 0) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        };

        return this.findOne(id)
            .then((object) => {
                if (!object) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                };
                return new this.dto({ id: id }).save({ is_deleted: 1 }, { patch: true });
            });
    }

    /**
     *
     * @param callback
     * @returns {BlueBird<any>}
     */
    public deleteByQuery(callback: (qb: QueryBuilder) => void): Promise<any[]> {
        return new this.dto().query(callback).destroy();
    }

    /**
     *
     * @returns {BlueBird<any>}
     */
    public truncate(): any {
        return new this.dto().query().truncate();
    }

    /**
     *
     * @param callback
     * @returns {BlueBird<any>}
     */
    public updateByQuery(callback: (qb: QueryBuilder) => void, data: any): Promise<T> {
        return new this.dto({}, false).query(callback).save(data, {
            method: "update",
            patch: true,
            require: false
        });
    }


    public list(related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X[]> {
        return new this.dto().query((): void => {
        })
            .fetchAll({ withRelated: related })
            .then((objects) => {
                let ret: X[] = [];
                if (objects != null && objects.models != null && _.isArray(objects.models)) {
                    objects.models.forEach(object => {
                        let model = this.converter.fromDto(object, filters);
                        if (model != null) {
                            ret.push(model);
                        }
                    });
                }
                return ret;
            });
    }

    public findAll(ids: string[], related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X[]> {
        if (ids == null || ids.length === 0) {
            return Promise.resolve([]);
        }
        let dto = new this.dto();
        return dto.query((q): void => {
            q.whereIn(dto.idAttribute, ids);
            q.where(dto.isDelete, false);
        })
            .fetchAll({ withRelated: related })
            .then((objects) => {
                let ret: X[] = [];
                if (objects != null && objects.models != null && _.isArray(objects.models)) {
                    objects.models.forEach(object => {
                        let model = this.converter.fromDto(object, filters);
                        if (model != null) {
                            ret.push(model);
                        }
                    });
                }
                return ret;
            });
    }

    public findOne(id: string, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X> {
        let ret: X = null;
        if (id == null || id === "") {
            return Promise.resolve(ret);
        }

        return this.findAll([id], related, filters)
            .then((objects) => {
                if (objects.length > 0) {
                    return objects[0];
                }
                return null;
            });
    }

    public countByQuery(callback: (qb: QueryBuilder) => void): Promise<number> {
        if (callback == null) {
            return Promise.resolve(0);
        }
        return new this.dto().query(callback).count()
            .then((total) => {
                return Number(total);
            });
    }

    public countFetchByQuery(callback: (qb: QueryBuilder) => void): Promise<number> {
        if (callback == null) {
            return Promise.resolve(0);
        }
        return new this.dto().query(callback).fetchAll()
        .then(items => {
            return items.length;
        });
    }

    public findByQuery(callback: (qb: QueryBuilder) => void, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X[]> {
        return new this.dto().query(callback).fetchAll({ withRelated: related })
            .then(items => {
                let ret: X[] = [];
                if (items != null && _.isArray(items.models))
                    items.models.forEach(item => {
                        let temp = this.converter.fromDto(item, filters);
                        if (temp != null) {
                            ret.push(temp);
                        }
                    });
                return ret;
            });
    }

    public findOneByQuery(callback: (qb: QueryBuilder) => void, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<X> {
        return new this.dto().query(callback).fetch({ withRelated: related })
            .then(item => {
                if (item != null) {
                    return this.converter.fromDto(item, filters);
                }
                return null;
            });
    }

    public countAndQuery(countQuery: (qb: QueryBuilder) => void, findQuery: (qb: QueryBuilder) => void, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<CollectionWrap<X>> {
        let ret = new CollectionWrap<X>();
        return this.countByQuery(countQuery)
            .then((total) => {
                ret.total = total;
                return this.findByQuery(findQuery, related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                return ret;
            });
    }

    public raw(query: string): Knex.Raw {
        return BaseDto.knex().raw(query);
    }

    public rawQuery(query: string) {
        return BaseDto.knex().raw(query).then(result => {
            return result.rows;
        });
    }
}

export default BaseRepository;
