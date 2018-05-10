/**
 * Created by ducbaovn on 12/06/17.
 */
import {ReportHandler} from "./report.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/get-quotation")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.getQuotation);

router.route("/unit")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.unit);

router.route("/user")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.user);

router.route("/announcements")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.getAnnouncements);

router.route("/events")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.getEvents);

router.route("/contracts")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.getContracts);

router.route("/feedbacks")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.getFeedbacks);

router.route("/booking")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.booking);

router.route("/revenue")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.revenue);

router.route("/feedback")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), ReportHandler.feedback);

export default router;
