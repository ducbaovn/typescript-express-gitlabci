/**
 * Created by ducbaovn on 19/04/17.
 */
import * as express from "express";

export const bodyParseFile = () => {
    return (req, res: express.Response, next: express.NextFunction): any => {
        req.pipe(req.busboy);
        req.body = "";
        req.busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            file.on("data", (data => {
                req.body += data.toString("utf8");
            }));
            file.on("end", (data => {
                next();
            }));
        });
    };
};

export default bodyParseFile;
