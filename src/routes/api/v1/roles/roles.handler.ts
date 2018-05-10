/**
 * Created by kiettv on 1/3/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {EXTENDED_HEADER} from "../../../../libs/constants";
import {HttpStatus} from "../../../../libs";
import {RoleService} from "../../../../interactors";

export class RoleHandler extends BaseHandler {
    public static list(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return Promise.resolve()
            .then(() => {
                return RoleService.list([], ["isEnable", "isDeleted"]);
            })
            .then((object) => {
                res.status(HttpStatus.OK);
                res.setHeader(EXTENDED_HEADER.HEADER_TOTAL, object.total.toString());
                res.json(object.data);
            })
            .catch(err => {
                next(err);
            });
    }
}

export default RoleHandler;
