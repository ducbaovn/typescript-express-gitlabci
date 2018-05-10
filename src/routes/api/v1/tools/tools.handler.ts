import { Request, Response, NextFunction } from "express";
import { BaseHandler } from "../base.handler";
import { Logger } from "../../../../libs";
import { ToolService } from "../../../../interactors";
import { HttpCode } from "../../../../libs/http_code";
import { SessionModel } from "../../../../models";

export class ToolHandler extends BaseHandler {
    public static restoreRedis(req: Request, res: Response, next: NextFunction) {
        res.status(HttpCode.OK);
        res.end();
        let date = SessionModel.getDate(req.query.date);

        return ToolService.restoreRedis(date)
            .catch((err: Error) => {
                Logger.error(err.message, err);
            });
    }
}

export default ToolHandler;
