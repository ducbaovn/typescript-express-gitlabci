/**
 * Created by davidho on 2/12/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {SessionModel, ExceptionModel, AnnouncementModel, UserModel} from "../../../../models";
import {ROLE, PROPERTIES} from "../../../../libs/constants";
import {HttpStatus, ErrorCode} from "../../../../libs/index";
import {AnnouncementService} from "../../../../interactors/index";
import {StateModel} from "../../../../models/state.model";


export class AnnouncementHandler extends BaseHandler {

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return Promise.resolve()
        .then(() => {
            let isResidenceOwners = AnnouncementModel.getBoolean(req.body.isResidenceOwners, false);
            let isResidenceTenants = AnnouncementModel.getBoolean(req.body.isResidenceTenants, false);
            let isNonResidence = AnnouncementModel.getBoolean(req.body.isNonResidence, false);
            let listUnitIds = AnnouncementModel.getArrayString(req.body.listUnitIds);
            let announcement = AnnouncementModel.fromRequest(req);

            return AnnouncementService.createTargeted(announcement, isResidenceOwners, isResidenceTenants, isNonResidence, listUnitIds);
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
        return AnnouncementService.findOne(req.params.id, ["images"], ["isDeleted"])
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
        return Promise.resolve()
        .then(() => {
            let session = res.locals.session || SessionModel.empty();

            let announcement = AnnouncementModel.fromRequest(req);
            announcement.id = req.params.id || "";
            if (!req.body.file) {
                announcement.file = "";
            }
            if (!req.body.coverPicture) {
                announcement.coverPicture = "";
            }
            return AnnouncementService.update(announcement);
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
        let announcementId = req.params.id || "";

        return AnnouncementService.removeById(announcementId)
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
        let user: UserModel = session.user;
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        queryParams.userId = session.userId;

        if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
            queryParams.isActive = true;
            queryParams.isResident = user.isResident;
            queryParams.roleId = session.roleId;
            queryParams.unitId = user.unitId;
        }

        return AnnouncementService.search(queryParams, offset, limit, ["images"], ["isDeleted"])
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

        return AnnouncementService.archive(announcementId)
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

        return AnnouncementService.read(announcementId, session.userId)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
}

export default AnnouncementHandler;
