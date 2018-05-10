/**
 * Created by kiettv on 12/17/16.
 */
import * as express from "express";
import api from "./api/v1";
import trigger from "./trigger/v1";

const router = express.Router();

router.get("/ping", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.end();
});

router.get("/favicon.ico", (req: express.Request, res: express.Response) => {
    res.status(404);
    res.end();
});

router.use("/api/v1", api);

router.use("/trigger/v1", trigger);

export default router;
