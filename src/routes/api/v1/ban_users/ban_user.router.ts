/**
 * Created by davidho on 4/13/17.
 */

import {BanUserHandler} from "./ban_user.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BanUserHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BanUserHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BanUserHandler.remove);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BanUserHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BanUserHandler.create);

export default router;
