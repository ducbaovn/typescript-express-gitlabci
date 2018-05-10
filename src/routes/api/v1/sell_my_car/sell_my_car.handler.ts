import * as express from "express";
import {BaseHandler} from "../base.handler";
import {SellMyCarModel, ExceptionModel, StateModel} from "../../../../models";
import {SellMyCarRepository} from "../../../../data";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {SellMyCarService} from "../../../../interactors";
import {MAX_SELL_MY_CAR, MESSAGE_INFO, PROPERTIES} from "../../../../libs/constants";
import * as Bluebird from "bluebird";
import {JsonMapper} from "../../../../libs/mapper/json.mapper";
import {SessionModel} from "../../../../models/session.model";

export class SellMyCarHandler extends BaseHandler {
    /**
     * list SellMyCar
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        return SellMyCarService.search(queryParams, offset, limit, [], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
            .then(SellMyCars => {
                res.header(PROPERTIES.HEADER_TOTAL, SellMyCars.total.toString(10));

                if (offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                }

                res.status(HttpStatus.OK);
                res.json(SellMyCars.data);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * create SellMyCar
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let sellMyCars: SellMyCarModel[] = [];
        req.body.forEach(data => {
            sellMyCars.push(JsonMapper.deserialize(SellMyCarModel, data));
        });
        if (sellMyCars.length > MAX_SELL_MY_CAR) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MAX_SELL_MY_CAR.CODE,
                ErrorCode.RESOURCE.MAX_SELL_MY_CAR.MESSAGE,
                false,
                HttpStatus.FORBIDDEN,
            ));
        }

        return Bluebird.resolve(sellMyCars)
            .then((sellMyCars) => {
                sellMyCars.forEach(sellMyCar => {
                    if (!sellMyCar.email) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                            ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                });
                return SellMyCarService.create(sellMyCars);
            })
            .then(() => {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * update SellMyCar
     * @param req
     * @param res
     * @param next
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let sellMyCar: SellMyCarModel;
        sellMyCar = SellMyCarModel.fromRequest(req.body);
        sellMyCar.id = req.params.id;

        return SellMyCarService.update(sellMyCar)
            .then(SellMyCarDto => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(SellMyCarDto.id));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static requestQuote(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let sellMyCar = SellMyCarModel.fromRequest(req.body);
        sellMyCar.userId = session.userId;

        if (SellMyCarHandler.checkConstraintRequestQuote(sellMyCar) === false) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        return SellMyCarService.requestQuote(sellMyCar, ["condo"])
            .then(object => {
                if (object === true) {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.stateSuccessful(null, MESSAGE_INFO.MI_SENT_SUCCESSFUL));
                }
            })
            .catch(err => {
                next(err);
            });
    }

    public static checkConstraintRequestQuote(data: SellMyCarModel) {
        let ret = true;
        if (data.vehicleNumber === "" || data.vehicleMilage === "" || data.passportNumber === "") {
            ret = false;
        }
        return ret;
    }
}

export default SellMyCarHandler;
