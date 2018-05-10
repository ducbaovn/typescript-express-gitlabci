/**
 * Created by kiettv on 12/18/16.
 */
import * as express from "express";

export const privilege = (): express.RequestHandler => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
        next();
    };
};

export default privilege;
