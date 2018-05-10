/**
 * Created by davidho on 2/18/17.
 */

import {CondoRulesHandler} from "./condo_rules.handler";
import * as express from "express";
import {isAuthenticated} from "../../../../middlewares";
const router = express.Router();

router.route("/:id")
    .get(isAuthenticated, CondoRulesHandler.view)
    .put(isAuthenticated, CondoRulesHandler.edit)
    .delete(isAuthenticated, CondoRulesHandler.remove);

router.route("/")
    .get(isAuthenticated, CondoRulesHandler.list)
    .post(isAuthenticated, CondoRulesHandler.create);

export default router;
