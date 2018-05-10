/**
 * Created by davidho on 2/24/17.
 */

import {HousingLoanHandler} from "./housing_loan.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/request-quote")
    .post(isAuthenticated, hasPrivilege([ROLE.OWNER, ROLE.TENANT]), hasCache(), HousingLoanHandler.requestQuote);

router.route("/:id")
//     .get(isAuthenticated, HousingLoanHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), HousingLoanHandler.edit);
//     .delete(isAuthenticated, HousingLoanHandler.delete);

router.route("/")
    .get(isAuthenticated, hasCache(), HousingLoanHandler.list);

export default router;
