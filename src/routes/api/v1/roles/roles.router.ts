/**
 * Created by kiettv on 1/3/17.
 */
import * as express from "express";
import handler from "./roles.handler";
const router = express.Router();

router.route("/")
    .get(handler.list);

export default router;

