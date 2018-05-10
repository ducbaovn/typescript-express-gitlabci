/**
 * Created by thanhphan on 4/13/17.
 */
import {SendMailHandler} from "./send_mail.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";

const router = express.Router();

router.route("/")
    .post(isAuthenticated, SendMailHandler.sendMail);
router.route("/requestcondo")
    .post(SendMailHandler.sendNewCondoRequest);
export default router;
