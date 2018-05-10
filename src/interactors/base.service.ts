import { BaseModel, CollectionWrap, ExceptionModel } from "../models";
import * as Promise from "bluebird";
import { BaseRepository } from "../data/base.repository";
import { ErrorCode, HttpStatus } from "../libs";
import { WithRelatedQuery } from "bookshelf";
/**
 * Created by kiettv on 1/2/17.
 */
export class BaseService<M extends BaseModel, R extends BaseRepository<any, M>> {
    private repo: R;

    constructor(repo: R) {
        this.repo = repo;
    }

    public list(related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<CollectionWrap<M>> {
        let ret: CollectionWrap<M> = new CollectionWrap<M>();
        return Promise.resolve()
            .then(() => {
                return this.repo.list(related, filters);
            })
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }

    public findOne(id: string, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<M> {
        return Promise.resolve()
            .then(() => {
                return this.repo.findOne(id, related, filters);
            });
    }

    public make(model: M, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<M> {
        return Promise.resolve()
            .then(() => {
                return this.repo.insert(model);
            })
            .then((object) => {
                return this.findOne(object.id, [], filters);
            });
    }

    public delete(id: string, related: (string | WithRelatedQuery)[] = [], filters: string[] = []): Promise<string> {
        return this.repo.deleteLogic(id)
            .then(() => {
                return id;
            });
    }
}

export default BaseService;
