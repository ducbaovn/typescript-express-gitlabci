/**
 * Created by ducbaovn on 04/07/17.
 */

import {HealthHandler} from "./health.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/")
    .get(HealthHandler.check);

export default router;
