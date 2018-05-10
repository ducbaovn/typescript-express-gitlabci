/**
 * Created by thanhphan on 4/13/17.
 */
import {AdvertiserHandler} from "./advertiser.handler";
import * as express from "express";
import {hasPrivilege, isAuthenticated} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

// 1. List advertiser in the iCondo network.
// 2. Add new advertiser.
router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertiserHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertiserHandler.create);

// 1. Advertiser detail.
// 2. Update advertiser.
// 3. Delete advertiser.
router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertiserHandler.detail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertiserHandler.update)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), AdvertiserHandler.delete);

export default router;
