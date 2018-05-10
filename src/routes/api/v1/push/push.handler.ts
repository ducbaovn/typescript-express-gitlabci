/**
 * Created by thanhphan on 4/13/17.
 */
import * as express from "express";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {PushNotificationService, DeviceService} from "../../../../interactors/index";
import {ExceptionModel, StateModel, PushMessageModel, SessionModel} from "../../../../models";
import {PROPERTIES} from "../../../../libs/constants";

export class PushHandler {

    public static listMessage(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;

        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        queryParams.userId = userId;

        return PushNotificationService.listMessage(queryParams, offset, limit)
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

    public static detailMessage(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = {
            id: req.params.id,
            userId: session.userId
        };

        return PushNotificationService.listMessage(queryParams, offset, limit)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(result.data[0]);
        })
        .catch(err => {
            next(err);
        });
    }

    public static readMessage(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let id = req.params.id;

        return PushNotificationService.readMessage(id)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteMessage(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let id = req.params.id;

        return PushNotificationService.deleteMessage(id)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(id));
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
    public static push(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let message = req.body;
            let obj = new PushMessageModel();

            obj.title = message.title;
            obj.body = message.body;
            obj.body = message.clickAction;
            obj.badge = message.badge;
            obj.data = message.data;

            if (PushHandler.checkConstraintField(message) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            DeviceService.pushToUsers(message.userIds, obj)
                .then(() => {
                    res.status(HttpStatus.NO_CONTENT);
                    res.json([]);
                })
                .catch(error => {
                    next(error);
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
    public static checkConstraintField(data: any): boolean {
        let result = true;

        if (!data.userIds || data.userIds.length === 0 || data.body === "") {
            result = false;
        }

        return result;
    }
}

export default PushHandler;
