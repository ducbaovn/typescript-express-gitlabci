/**
 * Created by davidho on 2/14/17.
 */

import {FeedbackHandler} from "./feedback.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache, passwordAuth} from "../../../../middlewares";
import {ROLE, FUNCTION_PASSWORD_TYPE} from "../../../../libs/constants";

router.route("/firebase/reset-counter")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), FeedbackHandler.resetCounterFirebase);

router.route("/category")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.listCategory)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FeedbackHandler.createCategory);

router.route("/category/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.detailCategory)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FeedbackHandler.updateCategory)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FeedbackHandler.deleteCategory);

router.route("/:id/reply")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.listReply)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.createReply);

router.route("/:id/resolve")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.FEEDBACK), hasCache(), FeedbackHandler.resolve);

router.route("/:id/reopen")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.FEEDBACK), hasCache(), FeedbackHandler.reopen);

router.route("/:id/read")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.read);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.detail);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.OWNER, ROLE.TENANT]), hasCache(), FeedbackHandler.create);

export default router;
