import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {ROLE, PROPERTIES} from "../../../../libs/constants";
import {ExceptionModel, SessionModel, WhatOnModel, StateModel} from "../../../../models";
import {ErrorCode, HttpStatus} from "../../../../libs/index";
import {WhatOnService} from "../../../../interactors/index";


export class WhatOnHandler extends BaseHandler {

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        return Promise.resolve()
        .then(() => {
            let whatOn = WhatOnModel.fromRequest(req);
            if (session.roleId === ROLE.SYSTEM_ADMIN) {
                whatOn.isAdminCreate = true;
            }

            return WhatOnService.create(whatOn);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static view(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return WhatOnService.findOne(req.params.id, ["images"], ["isDeleted"])
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
        let session = res.locals.session || SessionModel.empty();
        return Promise.resolve()
        .then(() => {
            let whatOn = WhatOnModel.fromRequest(req);
            whatOn.id = req.params.id || "";
            if (!req.body.file) {
                whatOn.file = "";
            }
            if (!req.body.coverPicture) {
                whatOn.coverPicture = "";
            }

            return WhatOnService.update(whatOn);

        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static remove(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let whatOnId = req.params.id || "";

        return WhatOnService.removeById(whatOnId)
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
    }

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        queryParams.userId = session.userId;

        if (session.roleId === ROLE.CONDO_MANAGER) {
            queryParams.isAdminCreate = false;
        }
        if (session.roleId === ROLE.SYSTEM_ADMIN) {
            queryParams.isAdminCreate = true;
        }
        if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
            queryParams.isActive = true;
        }
        return WhatOnService.search(queryParams, offset, limit, ["images"], ["isDeleted"])
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
    }

    public static archive(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let announcementId = req.params.id || "";

        return WhatOnService.archive(announcementId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }

    public static read(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let announcementId = req.params.id || "";
        return WhatOnService.read(announcementId, session.userId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
}

export default WhatOnHandler;
