import * as UUID from "uuid";
import * as express from "express";
import {Logger, Scheduler} from "../../../libs";
import tenant from "./tenant_expire";
import bookingReminder from "./booking_reminder";
import {SCHEDULER_SCRIPT} from "../../../libs/constants";

const router = express.Router();

router.use("/tenant", tenant);
router.use("/booking_reminder", bookingReminder);

router.post("/new", (req: express.Request, res: express.Response) => {
    Logger.info("Trigger test....");

    let job = Scheduler.createUniqueJob(SCHEDULER_SCRIPT.TRIGGER_NAME, {
        url: `${req.protocol}://${req.get("host")}`,
        path: "/trigger/v1/new",
        payload: {
            hello: UUID.v4(),
            id: "test",
        },
    }, UUID.v4());

    Scheduler.scheduleOneShot(job, new Date(Date.now() + 10 * 1000));
    // Scheduler.scheduleRepeat(job, "*\/30 * * * * *");

    res.status(200);
    res.end();
});

export default router;
