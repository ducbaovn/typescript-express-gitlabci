/**
 * Created by davidho on 2/24/17.
 */


import {ErrorCode, HttpStatus} from "../../../../libs";
import {ExceptionModel, SessionModel, StateModel, HousingLoanModel} from "../../../../models";
import * as express from "express";
import {PROPERTIES, ROLE, MESSAGE_INFO} from "../../../../libs/constants";
import {HousingLoanService} from "../../../../interactors/index";

export class HousingLoanHandler {
    public static requestQuote(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;

        return HousingLoanService.requestQuote(userId, ["condo"])
        .then(object => {
            if (object === true) {
                res.status(HttpStatus.OK);
                res.json(StateModel.stateSuccessful(null, MESSAGE_INFO.MI_SENT_SUCCESSFUL));
            }
        })
        .catch(err => {
            next(err);
        });
    }

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        return HousingLoanService.detail()
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(object);
        })
        .catch(err => {
            next(err);
        });
    }

    public static edit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let housingLoan = HousingLoanModel.fromRequest(req);
        housingLoan.id = req.params.id;
        return HousingLoanService.update(housingLoan)
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(object.id));
        })
        .catch(err => {
            next(err);
        });
    }
}

export default HousingLoanHandler;

