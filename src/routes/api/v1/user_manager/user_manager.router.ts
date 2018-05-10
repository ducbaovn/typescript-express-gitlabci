/**
 * Created by davidho on 3/3/17.
 */

import {UserManagerHandler} from "./user_manager.handler";
import * as express from "express";
import { isAuthenticated, hasPrivilege, hasCache } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";

const router = express.Router();

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserManagerHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), UserManagerHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserManagerHandler.delete);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserManagerHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), UserManagerHandler.create);

export default router;
