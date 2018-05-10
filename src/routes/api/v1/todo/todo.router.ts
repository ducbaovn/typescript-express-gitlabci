/**
 * Created by davidho on 2/12/17.
 */

import {TodoHandler} from "./todo.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/archive/:id")
    .put(isAuthenticated, TodoHandler.archive);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), TodoHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), TodoHandler.edit);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), TodoHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), TodoHandler.create)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), TodoHandler.remove);

export default router;
