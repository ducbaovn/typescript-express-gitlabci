import * as Promise from "bluebird";
import * as express from "express";
import {ErrorCode, HttpStatus, Logger, Mailer} from "../../../../libs";
import {ExceptionModel, SessionModel, EmailModel} from "../../../../models";
import {UserRepository} from "../../../../data";
import {UserManagerService} from "../../../../interactors";

export class SendMailHandler {

    public static sendMail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return Promise.resolve()
        .then(() => {
            let userIds: string[] = req.body.userIds || [];
            let session = res.locals.session || SessionModel.empty();

            return Promise.each(userIds, userId => {
                return UserRepository.findOne(userId)
                .then(user => {
                    return UserManagerService.findByUserId(session.userId, ["user", "condo"])
                    .then(userManager => {
                        if (!userManager) {
                            throw new ExceptionModel(
                                ErrorCode.RESOURCE.USER_INVALID.CODE,
                                ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST
                            );
                        }
                        let obj = EmailModel.fromRequest(req);
                        return Mailer.sendCustomEmailByManager(obj, user.emailContact, userManager);
                    });
                });
            });

        })
        .then(() => {
            res.status(HttpStatus.NO_CONTENT);
            res.json({});
        })
        .catch(error => {
            next(error);
        });
    }

    public static sendNewCondoRequest(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let data = req.body || {};
        if (!data.condoName || !data.phoneNumber || !data.email) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return Mailer.sendNewCondoRequest(data)
            .then((result) => {
                res.status(HttpStatus.NO_CONTENT);
                res.json({});
            })
            .catch(error => {
                next(error);
            });
    }
}

export default SendMailHandler;
