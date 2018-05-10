/**
 * Created by thanhphan on 4/13/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {ExceptionModel, StateModel, AdvertisingTemplateModel} from "../../../../models";
import {
    AdvertisingTemplateService, AdvertisingCondoService,
    RatingAdvertisingTemplateService
} from "../../../../interactors";
import {PROPERTIES} from "../../../../libs/constants";
import {AdvertisingCondoModel} from "../../../../models/advertising_condo.model";
import {RatingAdvertisingTemplateModel} from "../../../../models/rating_advertising_template.model";
import {JsonMapper} from "../../../../libs/mapper/json.mapper";
import {SessionModel} from "../../../../models/session.model";
import {RatingAdvertisingTemplateRepository} from "../../../../data/index";
import {RATING_ADVERTISING_TEMPLATE_SCHEMA} from "../../../../data/sql/schema";

export class AdvertisingTemplateHandler {

    // region Advertising Template
    /**
     * Function get list advertising template of advertiser.
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
                    return AdvertisingTemplateService.getAllAdvertisingTemplate(searchParams, offset, limit, ["advertiser", "pictures"]);
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
     * Function get template detail.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let templateId = req.params.id || "";
            let session = res.locals.session || SessionModel.empty();

            return Promise.resolve()
                .then(() => {
                    return AdvertisingTemplateService.getAdvertisingTemplateDetail(templateId);
                })
                .then((template) => {
                    return RatingAdvertisingTemplateRepository.findOneByQuery(q => {
                        q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID, template.id);
                        q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID, session.userId);
                    })
                        .then (rating => {
                            if (rating !== null) {
                                template.isRating = true;
                                template.myRatingValue = rating.ratingValue;
                            } else {
                                template.isRating = false;
                            }
                            return template;
                        });
                })
                .then(item => {
                    if (item != null) {
                        res.status(HttpStatus.OK);
                        res.json(item);
                    } else {
                        next(new ExceptionModel(ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST));
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Add new template.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let templateModelReq = AdvertisingTemplateModel.fromRequest(req);

            if (!AdvertisingTemplateHandler.checkConstraintFieldsAdvertisingTemplateModel(templateModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingTemplateService.createTemplate(templateModelReq)
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
     * Function update the advertising template.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let templateId = req.params.id || "";
            let templateModelReq = AdvertisingTemplateModel.fromRequest(req);

            // Validate constraint all fields.
            if (templateId === "" || !AdvertisingTemplateHandler.checkConstraintFieldsAdvertisingTemplateModel(templateModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingTemplateService.updateTemplate(templateId, templateModelReq)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(templateId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function delete advertising template by id.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let templateId = req.params.id || "";

            if (templateId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingTemplateService.deleteTemplate(templateId)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(templateId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // endregion

    // region Advertising to Condo
    /**
     * Function get list template assigned to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static listTemplateAssignedToCondo(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let searchParams = req.query;

            return Promise.resolve()
                .then(() => {
                    return AdvertisingCondoService.getAllTemplateByCondo(searchParams, offset, limit, ["advertiser", "condo", "category", "subCategory", "advertisingTemplate", "advertisingTemplate.pictures"]);
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
     * Function get detail the record contain template was assigned to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static detailTemplateToCondo(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let detailId = req.params.id || "";

            return Promise.resolve()
                .then(() => {
                    return AdvertisingCondoService.getAdvertisingByCondoDetail(detailId);
                })
                .then(item => {
                    if (item != null) {
                        res.status(HttpStatus.OK);
                        res.json(item);
                    } else {
                        next(new ExceptionModel(ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST));
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function assign template to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static assignTemplateToCondo(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let templateModelReq = AdvertisingCondoModel.fromRequest(req);

            if (!AdvertisingTemplateHandler.checkConstraintFieldsModelAssignedTemplate(templateModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingCondoService.assignTemplateToCondo(templateModelReq)
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
     * Update assign template to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static updateAssignTemplateToCondo(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let id = req.params.id || "";
            let templateModelReq = AdvertisingCondoModel.fromRequest(req);

            // Validate constraint all fields.
            if (id === "" || !AdvertisingTemplateHandler.checkConstraintFieldsModelAssignedTemplate(templateModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingCondoService.updateTemplateToCondo(id, templateModelReq)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function remove template assigned to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteTemplateToCondo(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let id = req.params.id || "";

            if (id === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return AdvertisingCondoService.deleteTemplateToCondo(id)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // endregion

    // region Private Method
    /**
     * Method validate all fields into template model.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFieldsAdvertisingTemplateModel(dataModel: AdvertisingTemplateModel): boolean {
        let result: boolean = false;

        if (dataModel != null) {
            if (dataModel.advertiserId != null && dataModel.advertiserId !== ""
                && dataModel.templateName != null && dataModel.templateName !== ""
                && dataModel.templateType != null && dataModel.templateType !== ""
            ) {
                result = true;
            }
        }

        return result;
    }

    /**
     * Method validate all fields into the assigned template model to condo.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFieldsModelAssignedTemplate(dataModel: AdvertisingCondoModel): boolean {
        let result: boolean = false;

        if (dataModel != null) {
            if (dataModel.advertiserId != null && dataModel.advertiserId !== ""
                && dataModel.condoId != null && dataModel.condoId !== ""
                && dataModel.templateId != null && dataModel.templateId !== ""
                && dataModel.expiryDate != null
            ) {
                result = true;
                // if (sponsorAds) {
                //     if (dataModel.frequency != null && dataModel.frequency > 0) {
                //         result = true;
                //     }
                // } else {
                //     if (dataModel.categoryId != null && dataModel.categoryId !== ""
                //         && dataModel.subCategoryId != null && dataModel.subCategoryId !== "") {
                //         result = true;
                //     }
                // }
            }
        }

        return result;
    }

    /**
     * Function get list template assigned to condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static listRandomTemplateBySubcategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = null;
        let limit = null;
        let searchParams = req.query;
        let session = res.locals.session || SessionModel.empty();

        return Promise.resolve()
            .then(() => {
                return AdvertisingCondoService.getAllTemplateByCondo(searchParams, offset, limit, ["subCategory", "advertisingTemplate.advertiser", "advertisingTemplate.pictures", "advertisingTemplate.templateRatings"]);
            })
            .then((result) => {
                let randomTemplate = AdvertisingCondoService.randomizeListTemplateBySubcategory(result.data);
                return AdvertisingTemplateService.checkIsRating(session.userId, randomTemplate);
            })
            .then(templates => {
                res.status(HttpStatus.OK);
                res.json(templates);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * templateId, {ratingValue: int} -> StateModel
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static ratingForTemplate(req: express.Request, res: express.Response, next: express.NextFunction) {
        let ratingTemplateModel = RatingAdvertisingTemplateModel.fromRequest(req.body);
        ratingTemplateModel.templateId = req.params.id;
        let session = res.locals.session || SessionModel.empty();
        ratingTemplateModel.userId = session.userId;
        // insert rating value into database
        return Promise.resolve()
            .then(() => {
                return RatingAdvertisingTemplateService.rating(ratingTemplateModel);
            })
            .then(() => {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
    // endregion
}

export default AdvertisingTemplateHandler;
