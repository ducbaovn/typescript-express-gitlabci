/**
 * Created by thanhphan on 4/13/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {ExceptionModel, StateModel, AdvertiserModel} from "../../../../models";
import {AdvertiserService} from "../../../../interactors";
import {PROPERTIES} from "../../../../libs/constants";

export class AdvertiserHandler {

    /**
     * Function get list advertisers in the iCondo network.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let searchParams = req.query;

            return Promise.resolve()
                .then(() => {
                    return AdvertiserService.getAllAdvertisers(searchParams, offset, limit);
                })
                .then((result) => {
                    res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }
                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(result.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function get advertiser detail.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let advertiserId = req.params.id || "";

            return Promise.resolve()
                .then(() => {
                    return AdvertiserService.getAdvertiserDetail(advertiserId);
                })
                .then(item => {
                    res.status(HttpStatus.OK);
                    res.json(item);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Add new advertiser.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let advertiserModelReq = AdvertiserModel.fromRequest(req);

            if (!AdvertiserHandler.checkConstraintFieldsAdvertiserModel(advertiserModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertiserService.createAdvertiser(advertiserModelReq)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.createSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function update the advertiser.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let advertiserId = req.params.id || "";
            let advertiserModelReq = AdvertiserModel.fromRequest(req);

            // Validate constraint all fields.
            if (advertiserId === "" || !AdvertiserHandler.checkConstraintFieldsAdvertiserModel(advertiserModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertiserService.updateAdvertiser(advertiserId, advertiserModelReq)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(advertiserId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function delete advertiser by id.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let advertiserId = req.params.id || "";

            if (advertiserId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertiserService.deleteAdvertiser(advertiserId)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(advertiserId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // region Private Method
    /**
     * Method validate all fields into advertiser model.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFieldsAdvertiserModel(dataModel: AdvertiserModel): boolean {
        let result: boolean = false;

        if (dataModel != null) {
            if (dataModel.businessName != null && dataModel.businessName !== ""
                && dataModel.contactName != null && dataModel.contactName !== ""
                && dataModel.phoneNumber != null && dataModel.phoneNumber !== ""
                && dataModel.mobileNumber != null && dataModel.mobileNumber !== ""
                && dataModel.email != null && dataModel.email !== ""
                && dataModel.website != null && dataModel.website !== ""
                && dataModel.website != null && dataModel.website !== ""
                && dataModel.addressLine1 != null && dataModel.addressLine1 !== ""
                && dataModel.addressLine2 != null && dataModel.addressLine2 !== ""
                && dataModel.postalCode != null && dataModel.postalCode !== ""
            ) {
                result = true;
            }
        }

        return result;
    }

    // endregion
}

export default AdvertiserHandler;
