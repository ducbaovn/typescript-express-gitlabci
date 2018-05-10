/**
 * Created by davidho on 1/9/17.
 */
import * as express from "express";
import { isAuthenticated, hasPrivilege } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";
import { ToolHandler } from "./tools.handler";

const router = express.Router();

router.route("/redis")
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), ToolHandler.restoreRedis);

export default router;
