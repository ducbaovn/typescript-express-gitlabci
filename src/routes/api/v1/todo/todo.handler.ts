/**
 * Created by davidho on 2/12/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {ROLE, PROPERTIES} from "../../../../libs/constants";
import {ExceptionModel, SessionModel, TodoModel, StateModel} from "../../../../models";
import {ErrorCode, HttpStatus} from "../../../../libs/index";
import {TodoService} from "../../../../interactors/index";
import * as _ from "lodash";

export class TodoHandler extends BaseHandler {
    /**
     * create
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            let todo = TodoModel.fromRequest(req);
            todo.userId = session.userId;
            if (TodoHandler.checkConstraintField(todo) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return TodoService.create(todo)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.createSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static view(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return TodoService.findOne(req.params.id, ["condo", "user"], ["isDeleted"])
            .then(object => {
                if (object === null) {
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                } else {
                    res.status(HttpStatus.OK);
                    res.json(object);
                }
            })
            .catch(err => {
                next(err);
            });
    }

    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let todo = TodoModel.fromRequest(req);
            todo.id = req.params.id;

            if (TodoHandler.checkConstraintField(todo) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return TodoService.update(todo)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let ids = req.body.ids || null;
            let arrId = [];

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            if (ids == null) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            if (_.isString(ids)) {
                arrId.push(ids);
            } else {
                arrId = ids;
            }
            return TodoService.removeById(arrId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }


    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;
            return TodoService.search(queryParams, offset, limit, ["condo", "user"], ["isDeleted"])
                .then(users => {
                    res.header(PROPERTIES.HEADER_TOTAL, users.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }
                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(users.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    public static archive(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let id = req.params.id || null;
            let status = req.body.isEnable || false;
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            return TodoService.archive(id, status)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful());
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintField(data: TodoModel): boolean {
        let result = true;
        if (data.content === "" || data.condoId === "") {
            result = false;
        }
        return result;
    }
}

export default TodoHandler;
