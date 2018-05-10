/**
 * Created by davidho on 3/19/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {SessionModel} from "../../../../models/session.model";
import {ROLE} from "../../../../libs/constants";
import {ExceptionModel} from "../../../../models/exception.model";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {StateModel} from "../../../../models/state.model";
import {isUndefined} from "util";
import {UserRepository} from "../../../../data/index";
import {PaymentGatewayManager} from "../../../../interactors/index";

export class PaymentHandler extends BaseHandler {
    public static generateClientToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();

        return Promise.resolve()
        .then(() => {
            return UserRepository.findOne(session.userId, ["condo.paymentGatewayAccount"]);
        })
        .then(object => {
            if (!object.condo) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            return PaymentGatewayManager.getClientKey(object.condo);
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(object);
        })
        .catch(err => {
            next(err);
        });
    }

}

export default PaymentHandler;
