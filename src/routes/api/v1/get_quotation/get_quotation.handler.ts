/**
 * Created by ducbaovn on 05/05/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { BaseHandler } from "../base.handler";
import { GetQuotationSubcategoryModel, GetQuotationServiceModel, ExceptionModel, StateModel, SessionModel, SmsModel } from "../../../../models";
import { GetQuotationSubcategoryRepository, GetQuotationServiceRepository, SmsRepository } from "../../../../data";
import { Utils, ErrorCode, HttpStatus } from "../../../../libs";
import { GetQuotationService, UserService, UserManagerService, AdvertiserService, SmsService, EmailService } from "../../../../interactors";
import { PROPERTIES, DELETE_STATUS, ENABLE_STATUS, SMS_TYPE, ROLE } from "../../../../libs/constants";
import * as Schema from "../../../../data/sql/schema";

export class GetQuotationHandler extends BaseHandler {
    /**
     * list subcategory
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listSubcategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let isAdmin = (session.roleId === ROLE.SYSTEM_ADMIN) ? true : false;
        let related = isAdmin ? ["services.advertiser", "services.smsCount", "services.emailCount"] : ["notExpiredServices.advertiser"];
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let params = req.query || null;

        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (params.id) {
                    q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID, params.id);
                }
                if (params.key) {
                    q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ILIKE", `%${params.key}%`);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME, "ASC");
                }
            };
        };
        return GetQuotationSubcategoryRepository.countAndQuery(query(), query(offset, limit, true), related, ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(subcategories => {
            res.header(PROPERTIES.HEADER_TOTAL, subcategories.total.toString(10));
            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }
            for (let subcategory of subcategories.data) {
                subcategory.services = _.sortBy(subcategory.services, function(o) {
                    return o.businessName.toLowerCase();
                });
            }
            res.status(HttpStatus.OK);
            res.json(subcategories.data);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * detail subcategory
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detailSubcategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let isAdmin = (session.roleId === ROLE.SYSTEM_ADMIN) ? true : false;
        let related = isAdmin ? ["services.advertiser", "services.smsCount", "services.emailCount"] : ["notExpiredServices.advertiser"];
        return GetQuotationSubcategoryRepository.findOne(req.params.id, related, ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(subcategory => {
            res.status(HttpStatus.OK);
            res.json(subcategory);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * create subcategory
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static createSubcategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let subcategory: GetQuotationSubcategoryModel;
        subcategory = GetQuotationSubcategoryModel.fromRequest(req);

        if (!subcategory.name) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return GetQuotationSubcategoryRepository.insert(subcategory)
        .then(getQuotaionSubcategoryDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(getQuotaionSubcategoryDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * update subcategory
     * @param req
     * @param res
     * @param next
     */
    public static updateSubcategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let subcategory: GetQuotationSubcategoryModel;
        subcategory = GetQuotationSubcategoryModel.fromRequest(req);
        subcategory.id = req.params.id;

        return GetQuotationSubcategoryRepository.update(subcategory)
        .then(getQuotationSubcategoryDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(getQuotationSubcategoryDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * delete subcategory (delete logic)
     * @param req
     * @param res
     * @param next
     */
    public static deleteSubcategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return GetQuotationSubcategoryRepository.deleteLogic(req.params.id)
        .then(getQuotationSubcategoryDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(getQuotationSubcategoryDto.id));
        })
        .catch(err => {
            next(err);
        });
    }
    /**
     * list get quotation services
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let params = req.query || null;

        return GetQuotationService.search(params, offset, limit, ["subcategory", "smsCount", "emailCount"], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(services => {
            res.header(PROPERTIES.HEADER_TOTAL, services.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(services.data);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * detail get quotation service
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        return GetQuotationServiceRepository.findOne(req.params.id, [], ["isDeleted", "isEnable", "createdDate", "updatedDate"])
        .then(service => {
            res.status(HttpStatus.OK);
            res.json(service);
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * create get quotation service
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let service: GetQuotationServiceModel;
        service = GetQuotationServiceModel.fromRequest(req);

        if (!service.advertiserId || !service.subcategoryId || !service.expiryDate || !(service.phoneNumber || service.mobile || service.email)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return GetQuotationServiceRepository.insert(service)
        .then(getQuotaionServiceDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(getQuotaionServiceDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * update get quotation service
     * @param req
     * @param res
     * @param next
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let service: GetQuotationServiceModel;
        service = GetQuotationServiceModel.fromRequest(req);
        service.id = req.params.id;
        if (req.body.phoneNumber === "") {
            service.phoneNumber = "";
        }
        if (req.body.email === "") {
            service.email = "";
        }
        if (req.body.mobile === "") {
            service.mobile = "";
        }
        if (service.phoneNumber === "" && service.email === "" && service.mobile === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return GetQuotationServiceRepository.update(service)
        .then(getQuotationServiceDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(getQuotationServiceDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * delete get quotation service (delete logic)
     * @param req
     * @param res
     * @param next
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return GetQuotationServiceRepository.deleteLogic(req.params.id)
        .then(getQuotationServiceDto => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(getQuotationServiceDto.id));
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * @param   req
     * @param   res
     * @param   next
     * @returns {boolean}
     */
    public static sendSMS(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let getQuotationInfo: any[] = req.body.getQuotationInfo || [];
        let message = req.body.message || null;
        let messageType = SMS_TYPE.GET_QUOTATION;

        return UserManagerService.findByUserId(userId)
        .then(userManager => {
            if (!userManager) {
                next(new ExceptionModel(
                    ErrorCode.RESOURCE.USER_INVALID.CODE,
                    ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return Promise.each(getQuotationInfo, (info => {
                    return SmsService.send(null, info.mobile, message, messageType, userManager.id, info.getQuotationId);
                }));
            }
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * @param   req
     * @param   res
     * @param   next
     * @returns {boolean}
     */
    public static sendEmail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let getQuotationInfo: any[] = req.body.getQuotationInfo || [];
        let message = req.body.message || null;

        return UserManagerService.findByUserId(userId, ["user", "condo"])
        .then(userManager => {
            if (!userManager) {
                next(new ExceptionModel(
                    ErrorCode.RESOURCE.USER_INVALID.CODE,
                    ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return EmailService.sendGetQuotation(getQuotationInfo, message, userManager);
            }
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }
}

export default GetQuotationHandler;
