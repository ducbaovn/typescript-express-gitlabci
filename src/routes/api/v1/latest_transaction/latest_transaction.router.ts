/**
 * Created by davidho on 2/6/17.
 */

import {LatestTransactionHandler} from "./latest_transaction.handler";
import * as express from "express";
import {isAuthenticated} from "../../../../middlewares";
const router = express.Router();

router.route("/push")
    .post(isAuthenticated, LatestTransactionHandler.push);

router.route("/:id")
    .get(isAuthenticated, LatestTransactionHandler.view)
    .put(isAuthenticated, LatestTransactionHandler.edit)
    .delete(isAuthenticated, LatestTransactionHandler.remove);

router.route("/")
    .get(isAuthenticated, LatestTransactionHandler.list)
    .post(isAuthenticated, LatestTransactionHandler.create);


export default router;
