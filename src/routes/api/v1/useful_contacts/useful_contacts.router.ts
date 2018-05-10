/**
 * Created by thanhphan on 4/5/17.
 */
import {UsefulContactsHandler} from "./useful_contacts.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

// 1. List categories of useful contacts for condo.
// 2. Add new category for condo.
router.route("/condo/:condo_id")
    .get(isAuthenticated, UsefulContactsHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.create);

// 1. Category detail.
// 2. Update category for useful contacts.
// 3. Delete category inside useful contacts.
router.route("/categories/:id")
    .get(isAuthenticated, UsefulContactsHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.delete);

// 1. Create new service (sub-category).
router.route("/subcategories")
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.createSubCategory);

// 1. Get service detail support for update sub-category
// 2. Update sub-category (image, name, description,...)
// 3. Delete sub-category.
router.route("/subcategories/:id")
    .get(isAuthenticated, UsefulContactsHandler.detailSubCategory)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.updateSubCategory)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.deleteSubCategory);

// 1. Get list partner by service id (sub-category).
router.route("/partners/:service_id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), UsefulContactsHandler.listPartner);

export default router;
