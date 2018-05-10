/**
 * Created by davidho on 1/19/17.
 */

import {MeHandler} from "./me.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/settings")
    .get(isAuthenticated, MeHandler.getSetting)
    .put(isAuthenticated, MeHandler.updateSetting);

router.route("/password")
    .put(isAuthenticated, MeHandler.changePassword);

router.route("/cancel-unit")
    .post(isAuthenticated, MeHandler.cancelUnit);

router.route("/card/default")
    .get(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), MeHandler.getCardDefault);

router.route("/card/token")
    .put(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), MeHandler.setCardDefault) // only support update card default,
    .delete(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), MeHandler.deleteCreditCard);


router.route("/card")
    .get(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), MeHandler.listCard)
    .post(isAuthenticated, hasPrivilege([ROLE.USER, ROLE.OWNER, ROLE.TENANT]), hasCache(), MeHandler.createCard);
    // .put(isAuthenticated, MeHandler.updateProfile);
    // .delete(isAuthenticated, MeHandler.deleteCreditCard);




// router.route("/:id")
    // .get(isAuthenticated, MeHandler.detail)
    // .put(isAuthenticated, MeHandler.edit)
    // .delete(isAuthenticated, MeHandler.delete);

router.route("/")
    .get(isAuthenticated, MeHandler.profile)
    .put(isAuthenticated, MeHandler.updateProfile);


export default router;
