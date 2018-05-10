/**
 * Created by ducbaovn on 06/07/17.
 */
import * as express from "express";
import { ApplicationHandler } from "./application.handler";
import { isAuthenticated, hasPrivilege, hasCache } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), ApplicationHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), ApplicationHandler.create);

router.route("/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), ApplicationHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), ApplicationHandler.delete);

export default router;
