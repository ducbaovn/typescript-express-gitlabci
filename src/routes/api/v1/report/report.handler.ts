/**
 * Created by ducbaovn on 12/06/17.
 */
import * as express from "express";
import * as momentTz from "moment-timezone";
import {BaseHandler} from "../base.handler";
import {ErrorCode, HttpStatus, Utils} from "../../../../libs";
import {
    SmsService,
    UserManagerService,
    CondoService,
    AnnouncementService,
    ContractService,
    WhatOnService,
    UserService,
    FeedbackService, BookingService
} from "../../../../interactors";
import {ExceptionModel, SessionModel} from "../../../../models";
import {CondoRepository, UserManagerRepository, AnnouncementRepository, WhatOnRepository} from "../../../../data/index";
import {SMS_TYPE, DELETE_STATUS, PROPERTIES, REPORT, STATUS_CONTRACT, TIME_ZONE, MOMENT_DATE_FORMAT, ROLE} from "../../../../libs/constants";
import {USER_MANAGER_TABLE_SCHEMA} from "../../../../data/sql/schema";

export class ReportHandler extends BaseHandler {
    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static getQuotation(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let params = req.query;
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let condoId = params.condoId;
        let startDate;
        let endDate;
        let totalSms;
        if (!params.startDate || !params.endDate) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        try {
            startDate = Utils.dateByFormat(params.startDate);
            endDate = Utils.dateByFormat(params.endDate);
        } catch (err) {
            return next(err);
        }
        if (session.roleId !== ROLE.CONDO_MANAGER || !params.condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return SmsService.countSms(SMS_TYPE.GET_QUOTATION, condoId, startDate, endDate)
            .then(count => {
                totalSms = count;
                return SmsService.getQuotationReport(condoId, startDate, endDate);
            })
            .then(result => {
                res.status(HttpStatus.OK);
                res.json({
                    totalSms: totalSms,
                    data: result
                });
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static unit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let condoId = req.query.condoId;
        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return CondoService.reportUnit(condoId)
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(result);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static user(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let condoId = req.query.condoId;
        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return UserService.reportUser(condoId)
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(result);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static booking(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let params = req.query;
        let condoId = params.condoId;
        let timezone = params.timezone;
        let startDate;
        let endDate;
        let report = {};
        if (!params.startDate || !params.endDate) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        try {
            startDate = Utils.dateByFormat(params.startDate);
            endDate = Utils.dateByFormat(params.endDate);
        } catch (err) {
            return next(err);
        }

        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return BookingService.reportBooking(condoId, startDate, endDate)
        .then(result => {
            report["booking"] = result;
            return BookingService.revenueGroupByName(condoId, startDate, endDate);
        })
        .then(result => {
            report["revenue"] = result;
            return BookingService.trending(condoId, timezone);
        })
        .then(result => {
            report["trending"] = result;
            res.status(HttpStatus.OK);
            res.json(report);
        })
        .catch(err => {
            next(err);
        });
    }

    public static getAnnouncements(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let queryParams = req.query;
        let offset = parseInt(queryParams.offset, 10);
        let limit = parseInt(queryParams.limit, 10);
        queryParams.startDate = queryParams.startDate ? Utils.dateByFormat(queryParams.startDate) : null;
        queryParams.endDate = queryParams.endDate ? Utils.dateByFormat(queryParams.endDate) : null;
        queryParams.isReport = true;

        return AnnouncementRepository.search(queryParams, offset, limit, ["images"], ["isDeleted"])
            .then((response: any) => {
                res.header(PROPERTIES.HEADER_TOTAL, response.total.toString(10));
                res.status(HttpStatus.OK);
                res.json(response.data);
            })
            .catch(error => {
                next(error);
            });
    }

    public static getEvents(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let queryParams = req.query;
        let offset = parseInt(queryParams.offset, 10);
        let limit = parseInt(queryParams.limit, 10);
        queryParams.startDate = queryParams.startDate ? Utils.dateByFormat(queryParams.startDate) : null;
        queryParams.endDate = queryParams.endDate ? Utils.dateByFormat(queryParams.endDate) : null;
        queryParams.isReport = true;

        if (session.roleId !== ROLE.CONDO_MANAGER || !queryParams.condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return Promise.resolve()
            .then(() => {
                return WhatOnRepository.search(queryParams, offset, limit, ["images"], ["isDeleted"]);
            })
            .then((response: any) => {
                res.header(PROPERTIES.HEADER_TOTAL, response.total.toString(10));
                res.status(HttpStatus.OK);
                res.json(response.data);
            })
            .catch(error => {
                next(error);
            });
    }

    public static getContracts(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let queryParams = req.query;
        let offset = parseInt(queryParams.offset, 10);
        let limit = parseInt(queryParams.limit, 10);
        queryParams.startDate = momentTz();
        queryParams.endDate = momentTz().add(REPORT.CONTRACT_NEXT_MONTH_EXPIRE, "months");
        queryParams.status = STATUS_CONTRACT.LIVE;

        if (session.roleId !== ROLE.CONDO_MANAGER || !queryParams.condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }
        return Promise.resolve()
            .then(() => {
                return ContractService.search(queryParams, offset, limit, [], ["isDeleted", "isEnable", "createdDate", "updatedDate"]);
            })
            .then((response: any) => {
                let ret: any = [];
                if (response && response.data) {
                    response.data.forEach(item => {
                        if (item.endDate.isBefore(queryParams.endDate)) {
                            item.isExpired = true;
                        } else {
                            item.isExpired = false;
                        }
                        ret.push(item);
                    });
                }
                res.header(PROPERTIES.HEADER_TOTAL, response.total.toString(10));
                res.status(HttpStatus.OK);
                res.json(ret);
            })
            .catch(error => {
                next(error);
            });
    }

    public static getFeedbacks(req: express.Request, res: express.Response, next: express.NextFunction): any {let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let params = req.query;
        let condoId = params.condoId;
        let timezone = params.timezone;
        let startDate;
        let endDate;
        let report = {};
        if (!params.startDate || !params.endDate) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        try {
            startDate = Utils.dateByFormat(params.startDate);
            endDate = Utils.dateByFormat(params.endDate);
        } catch (err) {
            return next(err);
        }
        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return FeedbackService.reportByStatus(condoId, startDate, endDate)
        .then(data => {
            report["data"] = data;
            return FeedbackService.reportTotalPending(condoId);
        })
        .then(result => {
            report["data"].push(result[0]);
            return FeedbackService.reportByCategory(condoId, startDate, endDate);
        })
        .then(result => {
            report["categories"] = result;
            return FeedbackService.trending(condoId, timezone);
        })
        .then(result => {
            report["trends"] = result;
            res.status(HttpStatus.OK);
            res.json(report);
        })
        .catch(error => {
            next(error);
        });
    }

    public static revenue(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let params = req.query;
        let condoId = params.condoId;
        let startDate;
        let endDate;
        if (!params.startDate || !params.endDate) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        try {
            startDate = Utils.dateByFormat(params.startDate);
            endDate = Utils.dateByFormat(params.endDate);
        } catch (err) {
            return next(err);
        }
        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return BookingService.revenue(condoId, startDate, endDate)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
    }

    public static feedback(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let userId = session.userId;
        let params = req.query;
        let condoId = params.condoId;
        let startDate;
        let endDate;
        if (!params.startDate || !params.endDate) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        try {
            startDate = Utils.dateByFormat(params.startDate);
            endDate = Utils.dateByFormat(params.endDate);
        } catch (err) {
            return next(err);
        }
        if (session.roleId !== ROLE.CONDO_MANAGER || !condoId) {
            next(new ExceptionModel(
                ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                false,
                HttpStatus.UNAUTHORIZED
            ));
        }

        return FeedbackService.reportByStatus(condoId, startDate, endDate)
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
    }
}

export default ReportHandler;
