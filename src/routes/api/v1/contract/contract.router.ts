/**
 * Created by ducbaovn on 04/05/17.
 */
import * as express from "express";
import {ContractHandler} from "./contract.handler";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.create);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.delete);

router.route("/:id/archive")
    .put(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), ContractHandler.archive);

export default router;
