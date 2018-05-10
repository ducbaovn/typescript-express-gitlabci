/**
 * Created by kiettv on 10/2/16.
 */
import { BaseService } from "./base.service";
import { ErrorCode, HttpStatus } from "../libs";
import { ExceptionModel, VariableModel } from "../models";
import * as Promise from "bluebird";
import { VariableRepository } from "./../data";
import { CollectionWrap } from "./../models/collections";
import { VARIABLE_TABLE_SCHEMA } from "./../data/sql/schema";
import { DELETE_STATUS } from "./../libs/constants";

export class VariableService extends BaseService<VariableModel, typeof VariableRepository> {
    constructor() {
        super(VariableRepository);
    }

    /**
     * @param searchParams
     * @param filters
     * @returns {Promise<any[]>}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<VariableModel>> {
        return VariableRepository.search(searchParams, offset, limit, related, filters);
    }

    /**
     *
     * @param model
     * @param filters
     * @returns {any}
     */
    public create(model: VariableModel, related = [], filters = []): Promise<VariableModel> {
        if (model != null) {
            return VariableRepository.findOneByQuery(q => {
                q.where(VARIABLE_TABLE_SCHEMA.FIELDS.KEY, model.keyword);
            })
                .then(object => {
                    if (object != null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return VariableRepository.insert(model);
                });
        }
        return Promise.resolve(null);
    }

    /**
     * @param model
     * @param filters
     * @returns {Promise<any>}
     */
    public update(model: VariableModel, related = [], filters = []): Promise<VariableModel> {
        if (model != null) {
            return VariableRepository.findOneByQuery(q => {
                q.where(VARIABLE_TABLE_SCHEMA.FIELDS.KEY, model.keyword);
            })
                .then(object => {
                    if (object !== null && object.id !== model.id) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return VariableRepository.update(model);
                });
        }
        return Promise.resolve(null);
    }

    /**
     * @param id
     * @returns {Promise<boolean>}
     */
    public removeById(id: string): Promise<any> {
        if (id != null) {
            return this.detailById(id)
                .then(() => {
                    return VariableRepository.deleteLogic(id);
                });
        }
        return Promise.resolve(null);
    }

    /**
     * @param id
     * @param filters
     * @returns {Bluebird<U>}
     */
    public detailById(id: string, related = [], filters = []): Promise<VariableModel> {
        return VariableRepository.findOneByQuery(q => {
            q.where(VARIABLE_TABLE_SCHEMA.FIELDS.ID, id);
        }, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                return object;
            });

    }

    /**
     * @param keyword
     * @param related
     * @param filters
     * @returns {Bluebird<any>}
     */
    public findByKeyword(keyword: string, related = [], filters = []): Promise<VariableModel> {
        return VariableRepository.findOneByQuery(q => {
            q.where(VARIABLE_TABLE_SCHEMA.FIELDS.KEY, keyword);
        }, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                return object;
            });

    }
}

export default VariableService;
