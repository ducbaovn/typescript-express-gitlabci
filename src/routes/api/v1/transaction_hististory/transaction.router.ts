/**
 * Created by thanhphan on 4/28/17.
 */
import {TransactionHandler} from "./transaction.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

// 1. List transaction history.
router.route("/history")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), TransactionHandler.list);

// 1. Payment charge and save transaction.
// router.route("/payment")
//     .post(isAuthenticated, TransactionHandler.saveTransaction);

// 1. Transaction history detail.
// 2. Delete transaction history.
router.route("/history/:id")
    .get(isAuthenticated, TransactionHandler.detail)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), TransactionHandler.deleteTransactionHistory);

export default router;
