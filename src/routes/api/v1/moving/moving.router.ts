/**
 * Created by ducbaovn on 04/05/17.
 */
import * as express from "express";
import {MovingHandler} from "./moving.handler";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN, ROLE.CONDO_SECURITY]), hasCache(), MovingHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), MovingHandler.create);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), MovingHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), MovingHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), MovingHandler.delete);

router.route("/:id/archive")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), MovingHandler.archive);

export default router;
