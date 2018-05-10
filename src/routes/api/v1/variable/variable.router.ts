/**
 * Created by davidho on 2/12/17.
 */

import { VariableHandler } from "./variable.handler";
import * as express from "express";
import { isAuthenticated, hasPrivilege, hasCache } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";

const router = express.Router();
router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), VariableHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), VariableHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), VariableHandler.remove);

router.route("/")
    .get(isAuthenticated, VariableHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), VariableHandler.create);

export default router;
