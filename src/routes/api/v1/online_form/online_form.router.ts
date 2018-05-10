/**
 * Created by davidho on 2/9/17.
 */

import {OnlineFormHandler} from "./online_form.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, passwordAuth} from "../../../../middlewares";
import {ROLE, FUNCTION_PASSWORD_TYPE} from "../../../../libs/constants";
const router = express.Router();

router.route("/category/template")
    .get(isAuthenticated, OnlineFormHandler.listCategoryTemplate);

router.route("/subCategory/template/:id")
    .get(isAuthenticated, OnlineFormHandler.listSubCategoryTemplate);

router.route("/category")
    .get(isAuthenticated, OnlineFormHandler.listCategory)
    .post(isAuthenticated, OnlineFormHandler.createCategory);

router.route("/category/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.viewCategory)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.editCategory)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.removeCategory);

router.route("/subCategory")
    .get(isAuthenticated, OnlineFormHandler.listSub)
    .post(isAuthenticated, OnlineFormHandler.createSub);

router.route("/subCategory/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.viewSub)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.editSub)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.removeSub);

router.route("/request/item/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), OnlineFormHandler.updateItemRequest)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), OnlineFormHandler.deleteItemRequest);

router.route("/request/item/:id/status")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.ONLINE_FORM), OnlineFormHandler.updateItemStatus);

router.route("/request") // get list online form request by user (using for CM)
    .get(isAuthenticated, OnlineFormHandler.listRequest)
    .post(isAuthenticated, hasPrivilege([ROLE.OWNER, ROLE.TENANT, ROLE.CONDO_MANAGER]), OnlineFormHandler.submitV2)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), OnlineFormHandler.resetCounter);

export default router;

