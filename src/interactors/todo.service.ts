/**
 * Created by davidho on 2/12/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, ExceptionModel, TodoModel} from "../models";
import {
    TodoRepository, CondoRepository
} from "../data";
import {ErrorCode, HttpStatus, Logger} from "../libs/index";
import * as _ from "lodash";
import {ENABLE_STATUS} from "../libs/constants";

export class TodoService extends BaseService<TodoModel, typeof TodoRepository> {
    constructor() {
        super(TodoRepository);
    }

    public create(todo: TodoModel, related = [], filters = []): Promise<TodoModel> {
        if (todo != null) {
            return CondoRepository.findOne(todo.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return TodoRepository.insertGet(todo);
                });
        }
        return Promise.resolve(null);
    }

    public update(todo: TodoModel, related = [], filters = []): Promise<TodoModel> {
        if (todo != null) {
            return TodoRepository.findOne(todo.id)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return TodoRepository.update(todo);
                });
        }
        return Promise.resolve(null);
    }

    public removeById(arrId: any = [], related = [], filters = []): Promise<boolean> {
        return Promise.resolve()
            .then(() => {
                _.each(arrId, id => {
                    return TodoRepository.deleteLogic(id)
                        .catch((error) => {
                            Logger.error(error.message, error);
                        });
                });
            })
            .then(() => {
                return true;
            });
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<TodoModel>> {
        return TodoRepository.search(searchParams, offset, limit, related, filters);
    }

    public archive(id: string, status: boolean = false): Promise<any> {
        return TodoRepository.findOne(id)
            .then(object => {
                if (object === null || object.isDeleted === true) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                object.id = object.id;
                object.isEnable = status;
                return TodoRepository.update(object);
            });
    }
}

export default TodoService;
