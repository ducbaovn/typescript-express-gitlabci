/**
 * Created by davidho on 1/14/17.
 */

import {MediaHandler} from "./media.handler";
import * as express from "express";
import {isAuthenticated} from "../../../../middlewares";

const router = express.Router();

router.route("/callback")
    .get(MediaHandler.checkHash)
    .post(MediaHandler.update);

router.route("/files")
    .post(isAuthenticated, MediaHandler.newFile);

export default router;
