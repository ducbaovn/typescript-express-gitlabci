import {FunctionPasswordHandler} from "./function_password.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FunctionPasswordHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FunctionPasswordHandler.create);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FunctionPasswordHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FunctionPasswordHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FunctionPasswordHandler.delete);

export default router;
