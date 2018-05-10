import * as express from "express";
import {Logger} from "../../../libs";
import {UserUnitService, WorkerService} from "../../../interactors";

const router = express.Router();

router.post("/expire", (req: express.Request, res: express.Response) => {
    Logger.info("Trigger was called: ", req.body);
    res.status(200);
    res.end();

    WorkerService.tenancyExpiry()
    .catch(err => Logger.error(err.message, err));
});

export default router;
