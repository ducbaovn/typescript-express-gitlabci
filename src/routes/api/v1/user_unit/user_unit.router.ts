/**
 * Created by baond on 26/04/17.
 */
import * as express from "express";
import {UserUnitHandler} from "./user_unit.handler";
import {isAuthenticated, hasPrivilege, hasCache, passwordAuth} from "../../../../middlewares";
import {ROLE, FUNCTION_PASSWORD_TYPE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), UserUnitHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), UserUnitHandler.createRequest)
    .delete(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), UserUnitHandler.archiveByClient);

router.route("/check")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), UserUnitHandler.checkRole);

router.route("/sms")
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), hasCache(), UserUnitHandler.sendSMS);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), UserUnitHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), passwordAuth(FUNCTION_PASSWORD_TYPE.UNIT_LOG), hasCache(), UserUnitHandler.update);

router.route("/:id/approve")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), passwordAuth(FUNCTION_PASSWORD_TYPE.NEW_USER), hasCache(), UserUnitHandler.approve);

router.route("/:id/reject")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), UserUnitHandler.reject);

router.route("/:id/archive")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), passwordAuth(FUNCTION_PASSWORD_TYPE.UNIT_LOG), hasCache(), UserUnitHandler.archive);

export default router;
