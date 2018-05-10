/**
 * Created by davidho on 4/13/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {ENABLE_STATUS, EXTENDED_HEADER, HEADERS, PROPERTIES, ROLE} from "../../../../libs/constants";
import {HttpStatus, ErrorCode} from "../../../../libs/index";
import {GarageSaleService} from "../../../../interactors/index";
import {SessionModel} from "../../../../models/session.model";
import {GarageSaleModel} from "../../../../models/garage_sale.model";
import {ExceptionModel} from "../../../../models/exception.model";
import {StateModel} from "../../../../models/state.model";

export class GarageSaleHandler extends BaseHandler {
    /**
     * get list category of feedback
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listCategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            // let session = res.locals.session || SessionModel.empty();

            return Promise.resolve()
                .then(() => {
                    return GarageSaleService.listGarageSaleCategory([], ["isDeleted", "isEnable"]);
                })
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.setHeader(EXTENDED_HEADER.HEADER_TOTAL, object.total.toString());
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }

    /**
     * create(submit) garage sale
     * @param req
     * @param res
     * @param next
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session: SessionModel = res.locals.session || SessionModel.empty();

            let garageSale = GarageSaleModel.fromRequest(req);
            garageSale.userId = session.userId;

            if (GarageSaleHandler.checkConstraintField(garageSale) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return GarageSaleService.create(garageSale, ["user"])
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

    /**
     * update garage sale
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let garageSale = GarageSaleModel.fromRequest(req);
            garageSale.id = req.params.id || "";
            garageSale.userId = session.userId;

            if (GarageSaleHandler.checkConstraintField(garageSale) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return GarageSaleService.update(garageSale)
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

    /**
     * Suppend Garage Sale
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static suspend(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let garageSale = GarageSaleModel.fromSuspendRequest(req);
            garageSale.id = req.params.id || "";

            return GarageSaleService.suspend(garageSale)
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
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;
            queryParams.userId = session.userId;

            if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
                queryParams.isEnable = ENABLE_STATUS.YES;
            }

            return GarageSaleService.search(queryParams, offset, limit, ["user", "user.unit", "condo"], ["isDeleted"])
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

    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let garageSaleId = req.params.id || "";

            return GarageSaleService.removeById(garageSaleId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
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
     * Get garage sale detail
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        let id = req.params.id;
        let session = res.locals.session || SessionModel.empty();

        return GarageSaleService.getDetailById(id, ["user", "user.unit", "condo"], ["isDeleted"], session.userId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintField(data: GarageSaleModel): boolean {
        let result = true;
        if (data.title === "" || data.type === "" || data.price === "" || data.content === "" || data.categoryId === "" || data.userId === "" || data.condoId === "" || data.images.length === 0) {
            result = false;
        }
        return result;
    }


}

export default GarageSaleHandler;
