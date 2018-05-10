import {FeedHandler} from "./feed.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/sponsors/:id")
    .get(isAuthenticated, FeedHandler.detailSponsor);

router.route("/comment/like/:commentId")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), FeedHandler.likeComment);

router.route("/comment/delete/:commentId")
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), FeedHandler.deleteComment);

router.route("/comment/:feedId")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), FeedHandler.listComment)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), FeedHandler.comment);

router.route("/like/:feedId")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), FeedHandler.like);

router.route("/suspend/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FeedHandler.suspend);

// MODIFY URL
router.route("/comment/:commentId/like")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.likeComment);

router.route("/comment/:commentId")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.updateComment)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.deleteComment);

router.route("/:feedId/comment")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.listComment)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.comment);

router.route("/:feedId/like")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.like);

router.route("/:id/suspend")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), FeedHandler.suspend);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.remove);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), FeedHandler.create);

export default router;
