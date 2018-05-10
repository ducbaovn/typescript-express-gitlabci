/**
 * Created by davidho on 2/20/17.
 */

import {CouncilMinutesHandler} from "./council_minutes.handler";
import * as express from "express";
import {isAuthenticated, hasPrivilege} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

const router = express.Router();

router.route("/:id")
    .get(isAuthenticated, CouncilMinutesHandler.view)
    .put(isAuthenticated, CouncilMinutesHandler.edit)
    .delete(isAuthenticated, CouncilMinutesHandler.remove);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), CouncilMinutesHandler.list)
    .post(isAuthenticated, CouncilMinutesHandler.create);

export default router;
