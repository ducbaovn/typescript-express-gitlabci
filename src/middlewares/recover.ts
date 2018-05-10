/**
 * Created by kiettv on 12/17/16.
 */
import * as express from "express";

interface RecoverFunction {
    (error: any, res: express.Response): void;
}

export const recover = (handle?: RecoverFunction): express.ErrorRequestHandler => {
    let fallback: RecoverFunction = (error: any, res: express.Response): void => {
        res.status(500);
        res.end();
    };

    let handler = handle || fallback;
    return (error: any, req: express.Request, res: express.Response, next: express.NextFunction): any => {
        handler(error, res);
        if (!res.finished) {
            fallback(error, res);
        }
    };
};

export default recover;
