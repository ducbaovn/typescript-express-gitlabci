/**
 * Created by davidho on 1/20/17.
 */

import {TokensHandler} from "./tokens.handler";
import * as express from "express";
import {isAuthenticated} from "../../../../middlewares";

const router = express.Router();

router.route("/:token")
    .get(TokensHandler.resetPassword);

export default router;
