/**
 * Created by davidho on 1/14/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {MediaModel} from "../../../../models";
import {MediaService} from "../../../../interactors";
import * as formidable from "formidable";
import {ErrorCode, HttpStatus, Uploader} from "../../../../libs/index";
import {Utils} from "../../../../libs/utils";
import {ExceptionModel} from "../../../../models/exception.model";
import {StateModel} from "../../../../models/state.model";
const UUID = require("uuid");

export class MediaHandler extends BaseHandler {
    public static checkHash(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            return Promise.resolve()
                .then(() => {
                    return MediaService.findByHash(req.query.hash);
                })
                .then((wrapper) => {
                    res.json(wrapper.data);
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    public static update(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let media = MediaModel.fromRequest(req.body);
            return Promise.resolve()
                .then(() => {
                    return MediaService.make(media);
                })
                .then(() => {
                    res.end();
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    public static newFile(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let form = new formidable.IncomingForm();

            form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
                let file = files["file"];

                if (file == null || file.path == null || file.name == null) {
                    return res.json(new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
                return Promise.resolve()
                    .then(() => {
                        let ext = "pdf";
                        let name = UUID.v4();
                        return Uploader.uploadFile(file.path, `pdf/${name}.${ext}`);

                    })
                    .then(object => {
                        let media = MediaModel.fromDataS3(object);
                        return MediaService.make(media, [], ["isEnable", "isDeleted"]);
                    })
                    .then(object => {

                        res.status(HttpStatus.OK);
                        res.json(object);
                    });

            });

        } catch (err) {
            next(err);
        }


    }
}

export default MediaHandler;

