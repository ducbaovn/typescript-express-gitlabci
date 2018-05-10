/**
 * Created by davidho on 1/5/17.
 */

import { AuthHandler } from "./auth.handler";
import { isAuthenticated } from "../../../../middlewares";
import * as express from "express";

const router = express.Router();

router.route("/")
    .post(AuthHandler.login);

router.route("/admin")
    .post(AuthHandler.adminLogin);

router.route("/admin/verify-pin")
    .post(AuthHandler.verifyPinAndLogin);

router.route("/firebase")
    .post(isAuthenticated, AuthHandler.firebaseLogin);

export default router;
