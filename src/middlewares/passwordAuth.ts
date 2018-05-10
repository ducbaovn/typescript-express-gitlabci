/**
 * Created by ducbaovn on 04/08/16.
 */
import * as express from "express";
import * as Promise from "bluebird";
import { ExceptionModel, SessionModel } from "../models";
import { Utils, ErrorCode, HttpStatus } from "../libs";
import { HEADERS, ROLE } from "../libs/constants";
import { FunctionPasswordService } from "../interactors";

export const passwordAuth = (functionPasswordType?: string): express.RequestHandler => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
        let session = res.locals.session || SessionModel.empty();
        let password = req.headers[HEADERS.PASSWORD];

        if (session.roleId !== ROLE.CONDO_MANAGER) {
            return next();
        }

        return Promise.resolve()
        .then(() => {
            if (!functionPasswordType) {
                return null;
            }
            return FunctionPasswordService.getPassword(session.userId, functionPasswordType);
        })
        .then(functionPassword => {
            if (!functionPassword) {
                functionPassword = session.user.password;
            }
            if (!password || !Utils.compareHash(password, functionPassword)) {
                return next(new ExceptionModel(
                    ErrorCode.AUTHENTICATION.WRONG_PASSWORD.CODE,
                    ErrorCode.AUTHENTICATION.WRONG_PASSWORD.MESSAGE,
                    false,
                    HttpStatus.UNAUTHORIZED
                ));
            }
            return next();
        });
    };
};

export default passwordAuth;
