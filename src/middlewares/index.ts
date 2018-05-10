/**
 * Created by kiettv on 12/17/16.
 */
import { SessionService, CacheService } from "../interactors";
import { ErrorCode, HttpStatus, Jwt } from "../libs";
import { HttpCode } from "../libs/http_code";
import { BearerObject } from "../libs/jwt";
import { ExceptionModel, SessionModel } from "../models";
import { AUTH_CODE, authenticate } from "./authentication";
import * as Promise from "bluebird";
import * as express from "express";

export const hasCache = (): express.RequestHandler => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
        let response = CacheService.get(req.path);
        if (response != null) {
            return res.json(response);
        }

        return next();
    };
};

export const hasPrivilege = (roles: string[] = []): express.RequestHandler => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
        let session: SessionModel = res.locals.session || SessionModel.empty();
        // TODO: KIET - atm check by session's role data, later will move to Redis
        let roleId: string = roles.find(item => item === session.roleId);
        if (roleId != null) {
            next();
        } else {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.FORBIDDEN,
            ));
        }
    };
};

export const isAuthenticated = authenticate(
    (meta: number): any => {
        let error: ExceptionModel = null;
        switch (meta) {
            case AUTH_CODE.INVALID_TOKEN:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN.CODE,
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
                break;
            case AUTH_CODE.INVALID_AUTHORIZATION_HEADER:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.INVALID_AUTHORIZATION_HEADER.CODE,
                    ErrorCode.AUTHENTICATION.INVALID_AUTHORIZATION_HEADER.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
                break;
            case AUTH_CODE.VIOLATE_RFC6750:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.VIOLATE_RFC6750.CODE,
                    ErrorCode.AUTHENTICATION.VIOLATE_RFC6750.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
                break;
            case AUTH_CODE.TOKEN_EXPIRE:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.TOKEN_EXPIRE.CODE,
                    ErrorCode.AUTHENTICATION.TOKEN_EXPIRE.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
                break;
            case AUTH_CODE.SINGLE_LOGGED_IN:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.SINGLE_LOGGED_IN.CODE,
                    ErrorCode.AUTHENTICATION.SINGLE_LOGGED_IN.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
                break;
            default:
                error = new ExceptionModel(
                    ErrorCode.AUTHENTICATION.GENERIC.CODE,
                    ErrorCode.AUTHENTICATION.GENERIC.MESSAGE,
                    false,
                    HttpCode.UNAUTHORIZED
                );
        }
        return error;
    },
    (path: string, method: string): boolean => {
        return false;
    },
    (token: string, deviceId: string): Promise<any> => {
        let jwtObject: BearerObject = null;
        return Promise.resolve()
            .then(() => {
                jwtObject = Jwt.decode(token);
                let current: number = Date.now();
                if (current < jwtObject.exp && Jwt.verify(token, deviceId)) {
                    return SessionService.verifyToken(jwtObject, token);
                } else {
                    throw AUTH_CODE.TOKEN_EXPIRE;
                }
            })
            .then((object) => {
                if (object == null) {
                    throw AUTH_CODE.INVALID_TOKEN;
                }
                jwtObject.payload.user = object.user;
                jwtObject.payload.roleId = object.roleId; // change to reddit
                return {
                    jwt: jwtObject,
                };
            });
    }
);

export * from "./cors";
export * from "./log";
export * from "./not_found";
export * from "./recover";
export * from "./body_parse_file";
export * from "./check_version";
export * from "./passwordAuth";