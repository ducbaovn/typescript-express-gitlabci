/**
 * Created by thanhphan on 4/13/17.
 */
import {AdvertisingTemplateHandler} from "./advertising_template.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

// region Advertising Template
// 1. List advertising template by advertiser..
// 2. Add new advertising template for advertiser.
router.route("/template")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.create);

// 1. Advertiser detail.
// 2. Update advertiser.
// 3. Delete advertiser.
router.route("/template/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.OWNER, ROLE.TENANT]), AdvertisingTemplateHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.delete);
// endregion

// region Advertising Template to Condo
// 1. Get list template assigned to condo.
// 2. Assign the template to condo.
router.route("/templatetocondo")
    .get(isAuthenticated, AdvertisingTemplateHandler.listTemplateAssignedToCondo)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.assignTemplateToCondo);

// 1. Get list template assigned to condo random by subcategory
router.route("/templatetocondo/random-by-subcategory")
    .get(isAuthenticated, AdvertisingTemplateHandler.listRandomTemplateBySubcategory);

// 1. Rating for template
router.route("/templatetocondo/:id/rating")
    .post(isAuthenticated, AdvertisingTemplateHandler.ratingForTemplate);

// 1. Get detail template assigned to condo.
// 2. Update template assigned.
// 3. Remove template assigned.
router.route("/templatetocondo/:id")
    .get(isAuthenticated, AdvertisingTemplateHandler.detailTemplateToCondo)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.updateAssignTemplateToCondo)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertisingTemplateHandler.deleteTemplateToCondo);
// endregion

export default router;
