import * as express from "express";
import {HttpStatus, Logger} from "../../../libs";
import {BookingService} from "../../../interactors";

const router = express.Router();

router.post("/reminder", (req: express.Request, res: express.Response) => {
    let data = req.body;
    let urlCallback = `${req.protocol}://${req.get("host")}`;

    res.status(HttpStatus.OK);
    res.end();

    try {
        if (data != null && data.id != null && data.id !== "") {
            // Please do not remove the console log information.
            Logger.info("Trigger booking reminder was called (model: {bookingId, type}): ", req.body);

            BookingService.bookingReminder(data.id, data.type, urlCallback)
                .catch(err => Logger.error(err.message, err));
        }
    } catch (err) {
        Logger.error(err.message, err);
    }
});

export default router;
