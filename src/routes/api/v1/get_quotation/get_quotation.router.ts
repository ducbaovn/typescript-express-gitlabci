/**
 * Created by ducbaovn on 05/05/17.
 */
import * as express from "express";
import {GetQuotationHandler} from "./get_quotation.handler";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/subcategory")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.listSubcategory)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.createSubcategory);

router.route("/sms")
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), hasCache(), GetQuotationHandler.sendSMS);

router.route("/email")
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), hasCache(), GetQuotationHandler.sendEmail);

router.route("/subcategory/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.detailSubcategory)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.updateSubcategory)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.deleteSubcategory);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.create);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), GetQuotationHandler.delete);

export default router;
