/**
 * Created by thanhphan on 4/13/17.
 */
import {PushHandler} from "./push.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), PushHandler.listMessage)
    .post(isAuthenticated, PushHandler.push);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), PushHandler.detailMessage)
    .put(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), PushHandler.readMessage)
    .delete(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), PushHandler.deleteMessage);

export default router;
