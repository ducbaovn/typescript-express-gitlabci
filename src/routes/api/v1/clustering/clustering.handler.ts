import * as express from "express";
import * as Bluebird from "bluebird";
import { PROPERTIES, ROLE, CLUSTERING_TYPE } from "../../../../libs/constants";
import { HttpStatus, ErrorCode, Utils, Logger } from "../../../../libs";
import { ClusteringService } from "../../../../interactors";
import { ClusteringMemberModel, ClusteringModel, ExceptionModel } from "../../../../models";
import * as _ from "lodash";

export class ClusteringHandler {

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let offset = ClusteringModel.getNumber(req.query.offset);
            let limit = ClusteringModel.getNumber(req.query.limit);
            limit = limit === 0 ? 20 : limit;
            let queryParams = req.query || {};
            return Bluebird.resolve()
                .then(() => {
                    return ClusteringService.search(queryParams, offset, limit, ["members.condo"]);
                })
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));

                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });
        }
        catch (err) {
            next(err);
        }
    }

    public static add(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let model = ClusteringModel.fromRequest(req.body);
            if (model.name == null || model.name === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.CLUSTER_NAME_INVALID.CODE,
                    ErrorCode.RESOURCE.CLUSTER_NAME_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            if (model.type == null || model.type === "" || !Object.keys(CLUSTERING_TYPE).find(key => CLUSTERING_TYPE[key] === model.type)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.CLUSTER_TYPE_INVALID.CODE,
                    ErrorCode.RESOURCE.CLUSTER_TYPE_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            return Bluebird.resolve()
                .then(() => {
                    return ClusteringService.createCluster(model);
                })
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(ClusteringModel.toResponse(object));
                })
                .catch((err: Error) => {
                    next(err);
                });
        }
        catch (err) {
            next(err);
        }
    }

    public static get(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let clusterId = ClusteringModel.getString(req.params.id);
            return ClusteringService.findOne(clusterId, ["members"])
                .then((obj) => {
                    res.status(HttpStatus.OK);
                    res.json(obj);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static edit(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let clusterId = ClusteringModel.getString(req.params.id);
            let model = ClusteringModel.fromRequest(req.body);
            model.id = clusterId;

            if (model.type != null && model.type !== "") {
                if (!Object.keys(CLUSTERING_TYPE).find(key => CLUSTERING_TYPE[key] === model.type)) {
                    return next(new ExceptionModel(
                        ErrorCode.RESOURCE.CLUSTER_TYPE_INVALID.CODE,
                        ErrorCode.RESOURCE.CLUSTER_TYPE_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
            }
            return ClusteringService.editCluster(model)
                .then((model) => {
                    res.status(HttpStatus.OK);
                    res.json(model);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static addMember(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let clusterId = ClusteringModel.getString(req.params.id);
            let arr = req.body != null && req.body.length > 0 ? req.body : [];
            if (arr.length === 0) {
                res.json([]);
            } else {
                let members = arr.map(item => ClusteringMemberModel.fromRequest(item));
                return ClusteringService.addMembers(clusterId, members)
                    .then((object) => {
                        res.status(HttpStatus.OK);
                        res.json(object);
                    })
                    .catch(err => next(err));
            }
        }
        catch (err) {
            next(err);
        }
    }

    public static removeMember(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let clusterId = ClusteringModel.getString(req.params.id);
            let memberId = ClusteringModel.getString(req.params.memberId);
            return ClusteringService.removeMember(clusterId, memberId)
                .then(() => {
                    res.status(HttpStatus.NO_CONTENT);
                    res.end();
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static remove(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let clusterId = ClusteringModel.getString(req.params.id);
            return ClusteringService.remove(clusterId)
                .then(() => {
                    res.status(HttpStatus.NO_CONTENT);
                    res.end();
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

}

export default ClusteringHandler;
