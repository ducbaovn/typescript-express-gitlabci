import * as express from "express";
import {isAuthenticated, hasPrivilege, passwordAuth} from "../../../../middlewares";
import {BookingHandler} from "./booking.handler";
import {ROLE, FUNCTION_PASSWORD_TYPE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT, ROLE.CONDO_SECURITY]), BookingHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), passwordAuth(FUNCTION_PASSWORD_TYPE.BOOKING), BookingHandler.create);

router.route("/deposit")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), BookingHandler.listDeposit)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), BookingHandler.resetDepositCounter);

router.route("/validate")
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BookingHandler.validate);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BookingHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), BookingHandler.confirmPayment)
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), passwordAuth(FUNCTION_PASSWORD_TYPE.BOOKING), BookingHandler.cancel);

router.route("/update/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.BOOKING), BookingHandler.update);

router.route("/updateNote/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.BOOKING), BookingHandler.updateNote);

router.route("/deposit/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.DEPOSIT), BookingHandler.updateDeposit);

router.route("/deleteHistory/:id")
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), BookingHandler.delete);

export default router;
