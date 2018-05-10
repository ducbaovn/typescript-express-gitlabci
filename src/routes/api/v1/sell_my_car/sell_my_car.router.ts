/**
 * Created by ducbaovn on 04/05/17.
 */
import * as express from "express";
import {SellMyCarHandler} from "./sell_my_car.handler";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/request-quote")
    .post(isAuthenticated, hasPrivilege([ROLE.OWNER, ROLE.TENANT]), hasCache(), SellMyCarHandler.requestQuote);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), SellMyCarHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), SellMyCarHandler.create);

router.route("/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN]), hasCache(), SellMyCarHandler.update);

export default router;
