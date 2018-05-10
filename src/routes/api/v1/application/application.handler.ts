/**
 * Created by ducbaovn on 06/07/17.
 */

import * as Promise from "bluebird";
import * as express from "express";
import { QueryBuilder } from "knex";
import { ErrorCode, HttpStatus } from "../../../../libs";
import { ExceptionModel, StateModel, ApplicationModel } from "../../../../models";
import { PROPERTIES, ROLE } from "../../../../libs/constants";
import { ApplicationRepository } from "../../../../data";
import * as Schema from "../../../../data/sql/schema";

export class ApplicationHandler {
    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let params = req.query || {};

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q: QueryBuilder): void => {
                if (params.platform) {
                    q.where(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.PLATFORM, params.platform);
                }
                if (params.version) {
                    q.where(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.VERSION, params.version);
                }
                if (isOrder) {
                    q.orderBy(`${Schema.APPLICATION_TABLE_SCHEMA.FIELDS.VERSION}`, "DESC");
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }
            };
        };
        return ApplicationRepository.countAndQuery(query(), query(offset, limit, true), [], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(result => {
            res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));
            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }
            res.status(HttpStatus.OK);
            res.json(result.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let application = ApplicationModel.fromRequest(req);

        return ApplicationRepository.insert(application)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            if (!(err instanceof ExceptionModel)) {
                err = new ExceptionModel(
                    ErrorCode.RESOURCE.GENERIC.CODE,
                    err.message,
                    false,
                    HttpStatus.BAD_GATEWAY
                );
            }
            next(err);
        });
    }

    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let application = ApplicationModel.fromRequest(req);
        application.id = req.params.id;

        if (!application.id) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return ApplicationRepository.update(application)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(application.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let applicationId = req.params.id;

        return ApplicationRepository.forceDelete(applicationId)
            .then((success) => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful(applicationId));
            })
            .catch(err => {
                next(err);
            });
    }
}

export default ApplicationHandler;

