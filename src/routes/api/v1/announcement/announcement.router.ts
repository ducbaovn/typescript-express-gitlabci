/**
 * Created by davidho on 2/12/17.
 */

import {AnnouncementHandler} from "./announcement.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";
const router = express.Router();

router.route("/archive/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), AnnouncementHandler.archive);

router.route("/read/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), AnnouncementHandler.read);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), AnnouncementHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), AnnouncementHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), AnnouncementHandler.remove);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), AnnouncementHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), AnnouncementHandler.create);

export default router;
