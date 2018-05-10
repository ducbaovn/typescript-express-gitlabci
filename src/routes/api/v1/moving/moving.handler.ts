/**
 * Created by ducbaovn on 08/05/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { BaseHandler } from "../base.handler";
import { MovingModel, ExceptionModel, StateModel } from "../../../../models";
import { MovingRepository } from "../../../../data";
import { ErrorCode, HttpStatus, Utils } from "../../../../libs";
import {STATUS_MOVING, PROPERTIES, MOMENT_DATE_FORMAT} from "../../../../libs/constants";
import {MovingService} from "../../../../interactors";

export class MovingHandler extends BaseHandler {
    /**
     * list Moving
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        return MovingService.archiveExpired()
        .then(result => {
            return MovingService.search(queryParams, offset, limit, ["block", "unit"], ["isDeleted", "isEnable", "createdDate", "updatedDate"]);
        })
        .then(movings => {
            res.header(PROPERTIES.HEADER_TOTAL, movings.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(movings.data);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * detail Moving
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        return MovingRepository.findOne(req.params.id, ["block", "unit"], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(moving => {
            res.status(HttpStatus.OK);
            res.json(moving);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * create Moving
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let moving: MovingModel;
        moving = MovingModel.fromRequest(req);

        if (!moving.type || !moving.condoId || !moving.blockId || !moving.unitId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        if (moving.email && !Utils.validateEmail(moving.email)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return MovingRepository.insert(moving)
        .then(movingDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(movingDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * update Moving
     * @param req
     * @param res
     * @param next
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let moving: MovingModel;
        moving = MovingModel.fromRequest(req);
        moving.id = req.params.id;

        if (moving.email && !Utils.validateEmail(moving.email)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.CODE,
                ErrorCode.RESOURCE.INVALID_EMAIL_FORMAT.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return MovingRepository.update(moving)
        .then(movingDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(movingDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * delete Moving (delete logic)
     * @param req
     * @param res
     * @param next
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return MovingRepository.deleteLogic(req.params.id)
        .then(movingDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(movingDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * archive moving (update status to "archived")
     * @param req
     * @param res
     * @param next
     */
    public static archive(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return MovingService.archive(req.params.id)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }
}

export default MovingHandler;
