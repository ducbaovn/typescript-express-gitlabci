/**
 * Created by kiettv on 12/18/16.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {ROLE} from "../libs/constants";

interface OnError {
    (meta: number): any;
}

interface OnCheckWhiteList {
    (path: string, method: string): boolean;
}

interface OnVerify {
    (token: string, deviceId: string): Promise<any>;
}

export const AUTH_CODE = {
    INVALID_TOKEN: 1,
    INVALID_AUTHORIZATION_HEADER: 2,
    VIOLATE_RFC6750: 3,
    TOKEN_EXPIRE: 4,
    SINGLE_LOGGED_IN: 5
};

/**
 *
 * @param onError Error callback
 * @param onCheck URL check callback
 * @param onVerify Token verify callback
 * @return {express.RequestHandler}
 */
export const authenticate = (onError?: OnError, onCheck?: OnCheckWhiteList, onVerify?: OnVerify): express.RequestHandler => {
    const QUERY_KEY = "access_token";
    const BODY_KEY = "access_token";
    const TRAGEDY_KEY = "Bearer";
    const AUTH_HEADER = "authorization";
    const DEVICE_HEADER = "device-id";

    let errorCallback = onError != null ? onError : (meta: number): any => {
        return new Error(meta.toString());
    };
    //noinspection JSUnusedLocalSymbols
    let checkUrlCallback = onCheck != null ? onCheck : (path: string, method: string): boolean => {
        return false;
    };
    //noinspection JSUnusedLocalSymbols
    let verifyCallback = onVerify != null ? onVerify : (token: string, deviceId: string): Promise<any> => {
            return Promise.resolve(true);
        };

    return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
        return Promise.resolve()
            .then(() => {
                let token: string;
                let error: boolean;

                if (req.query && req.query[QUERY_KEY]) {
                    token = req.query[QUERY_KEY];
                }

                if (req.body && req.body[BODY_KEY]) {
                    if (token) {
                        error = true;
                    }
                    token = req.body[BODY_KEY];
                }

                if (req.header(AUTH_HEADER) != null) {
                    let parts = req.header(AUTH_HEADER).split(" ");
                    if (parts.length === 2 && parts[0] === TRAGEDY_KEY) {
                        if (token) {
                            error = true;
                        }
                        token = parts[1];
                    }
                }

                if (error) {
                    throw errorCallback(AUTH_CODE.VIOLATE_RFC6750);

                }
                return token;
            })
            .then(token => {
                if ((token == null || token === "") && checkUrlCallback(req.baseUrl, req.method)) {
                    throw errorCallback(AUTH_CODE.INVALID_AUTHORIZATION_HEADER);
                }
                return verifyCallback(token, req.header(DEVICE_HEADER));
            })
            .then((object) => {
                if (object != null && object.jwt != null && object.jwt.payload != null) {
                    res.locals.session = object.jwt.payload;
                    let user = res.locals.session.user;
                    if (user.condoManager) {
                        req.query.condoId = user.condoManager.id;
                        req.body.condoId = user.condoManager.id;
                        req.query.timezone = user.condoManager.timezone;
                        req.body.timezone = user.condoManager.timezone;
                    } else if (user.condo) {
                        req.query.condoId = user.condo.id;
                        req.body.condoId = user.condo.id;
                        req.query.timezone = user.condo.timezone;
                        req.body.timezone = user.condo.timezone;
                    }
                    next();
                } else {
                    next(errorCallback(AUTH_CODE.INVALID_TOKEN));
                }
                return true;
            })
            .catch(error => {
                next(errorCallback(error));
            });
    };
};

export default authenticate;
