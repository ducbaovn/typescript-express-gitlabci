/**
 * Created by davidho on 4/13/17.
 */

import {GarageSaleHandler} from "./garage_sale.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/category")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.listCategory);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.remove);

router.route("/suspend/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), GarageSaleHandler.suspend);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), GarageSaleHandler.create);


export default router;
