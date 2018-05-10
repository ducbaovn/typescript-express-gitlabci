/**
 * Created by davidho on 1/9/17.
 */
import * as express from "express";
import { UserHandler } from "./users.handler";
import { isAuthenticated, hasPrivilege, hasCache, passwordAuth } from "../../../../middlewares";
import { ROLE, FUNCTION_PASSWORD_TYPE } from "../../../../libs/constants";

const router = express.Router();

router.route("/ping")
    .post(UserHandler.ping);

router.route("/verify-email")
    .post(UserHandler.verifyEmail);

router.route("/send-pin")
    .post(UserHandler.sendPin);

router.route("/verify-pin-register")
    .post(UserHandler.verifyPinAndRegister);

router.route("/forgotpassword")
    .post(UserHandler.forgotPassword);

router.route("/logout")
    .post(isAuthenticated, UserHandler.logout);

router.route("/security")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserHandler.listSecurity)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserHandler.createSecurity);

router.route("/security/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserHandler.detailSecurity)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserHandler.updateSecurity)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserHandler.deleteSecurity);

router.route("/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.UNIT_LOG), hasCache(), UserHandler.edit)
    .delete(isAuthenticated, UserHandler.remove);

router.route("/")
    .get(isAuthenticated, UserHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.NEW_USER), UserHandler.create);

export default router;
