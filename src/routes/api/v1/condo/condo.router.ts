/**
 * Created by davidho on 1/12/17.
 */

import { CondoHandler } from "./condo.handler";
import * as express from "express";
import { isAuthenticated, hasPrivilege, hasCache } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";
import { bodyParseFile } from "../../../../middlewares";
import * as busboy from "connect-busboy";

const router = express.Router();

router.route("/verify-unit")
    .post(CondoHandler.verifyUnit);

router.route("/information/:id")
    .get(isAuthenticated, CondoHandler.information);

router.route("/")
    .get(CondoHandler.list)
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.delete)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.create);

router.route("/name")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.USER]), hasCache(), CondoHandler.listName);

router.route("/name/import")
    .post(busboy(), bodyParseFile(), CondoHandler.importCondoName);

router.route("/name/verify")
    .get(hasCache(), CondoHandler.verifyName);

router.route("/block")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.listBlock)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.createBlock)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.editBlock)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.deleteBlock);

router.route("/block/floor")
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.createFloor)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.editFloor)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.deleteFloor);

router.route("/block/floor/unit")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.listUnit)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.createUnit)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.editUnit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.deleteUnit);

router.route("/block/floor/unit/unregister")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.SYSTEM_ADMIN]), hasCache(), CondoHandler.unregisteredUnit);

router.route("/:condoId/import-block-floor-unit")
    .post(busboy(), bodyParseFile(), CondoHandler.importBlockFloorUnit);

export default router;
