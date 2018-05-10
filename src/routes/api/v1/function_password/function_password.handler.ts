import * as express from "express";
import * as Promise from "bluebird";
import { BaseHandler } from "../base.handler";
import { PROPERTIES } from "../../../../libs/constants";
import { HttpStatus, ErrorCode } from "../../../../libs";
import { FunctionPasswordRepository } from "../../../../data";
import { FunctionPasswordModel, StateModel } from "../../../../models";

export class FunctionPasswordHandler extends BaseHandler {

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        return Promise.resolve()
        .then(() => {
            return FunctionPasswordRepository.search(queryParams, offset, limit);
        })
        .then(list => {
            res.header(PROPERTIES.HEADER_TOTAL, list.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(list.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        let functionPasswordId = req.params.id || null;

        return FunctionPasswordRepository.findOne(functionPasswordId)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(object);
        })
        .catch(err => {
            next(err);
        });
    }

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return Promise.resolve()
        .then(() => {
            let functionPassword = FunctionPasswordModel.fromRequest(req);
            return FunctionPasswordRepository.insert(functionPassword);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return Promise.resolve()
        .then(() => {
            let functionPassword = FunctionPasswordModel.fromRequest(req);
            functionPassword.id = req.params.id || "";
            return FunctionPasswordRepository.update(functionPassword);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let functionPasswordId = req.params.id;

        return FunctionPasswordRepository.forceDelete(functionPasswordId)
        .then((object) => {
            if (object === true) {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful(functionPasswordId));
            } else {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteUnSuccessful(functionPasswordId));
            }
        })
        .catch(err => {
            next(err);
        });
    }
}

export default FunctionPasswordHandler;
