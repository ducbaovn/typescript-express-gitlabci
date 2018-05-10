import {PaymentHandler} from "./payment.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/token")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), hasCache(), PaymentHandler.generateClientToken);

router.route("/stripe/callback")
    .get(PaymentHandler.generateClientToken);

export default router;
