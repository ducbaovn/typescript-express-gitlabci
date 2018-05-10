import * as Promise from "bluebird";
import * as express from "express";
import {BookingModel, ExceptionModel, SessionModel, StateModel} from "../../../../models";
import {BookingService} from "../../../../interactors";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {DEPOSIT_STATUS, MOMENT_DATE_FORMAT, PAYMENT_STATUS, PROPERTIES, ROLE} from "../../../../libs/constants";
import {Utils, Logger} from "../../../../libs";

export class BookingHandler {

    /**
     * Get list booking
     * @param req
     * @param res
     * @param next
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();

        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
            queryParams.userId = session.userId;
            queryParams.isEnable = true;
        }

        return BookingService.search(queryParams, offset, limit, ["items.slot", "items.slot.rule", "items.facility", "user.userUnit", "unit", "condo", "block"])
            .then(response => {
                res.header(PROPERTIES.HEADER_TOTAL, response.total.toString(10));

                if (offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                }

                res.status(HttpStatus.OK);
                res.json(response.data);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * [DEPOSIT]: Get list booking
     * @param req
     * @param res
     * @param next
     */
    public static listDeposit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();

        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        queryParams.depositStatus = [DEPOSIT_STATUS.PENDING, DEPOSIT_STATUS.DUE];
        queryParams.paymentStatus = [PAYMENT_STATUS.NEW, PAYMENT_STATUS.NOT_APPLICABLE, PAYMENT_STATUS.PAID];

        return BookingService.search(queryParams, offset, limit, ["items.slot", "items.slot.rule", "items.facility", "user", "unit", "condo", "block"])
            .then(response => {
                res.header(PROPERTIES.HEADER_TOTAL, response.total.toString(10));

                if (offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                }

                res.status(HttpStatus.OK);
                res.json(response.data);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * [DEPOSIT]: Update deposit booking status
     * @param req
     * @param res
     * @param next
     */
    public static updateDeposit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let queryParams = req.query;
        let id = req.params.id;
        let depositStatus = queryParams.depositStatus;

        return BookingService.updateDeposit(id, depositStatus)
            .then(response => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(id));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Get detail
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>|Promise<U|U>}
     */
    public static view(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let bookingId = req.params.id || null;
            return BookingService.findOne(bookingId, ["items.slot", "items.slot.rule", "items.facility", "user", "unit", "condo", "block"])
                .then(object => {
                    if (object == null) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Create booking.
     *
     * @param req
     * @param res
     * @param next
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let params = req.body || {};
            let booking: BookingModel = BookingModel.fromRequest(params);
            let fromCM: boolean = false;
            let bookForCondo: boolean = false;
            let urlCallback = `${req.protocol}://${req.get("host")}`;

            if (session.roleId === ROLE.CONDO_MANAGER) {
                fromCM = true;
                bookForCondo = booking.userId === session.userId;
                booking.condoId = session.user.condoManager.id;
                if (params.paymentStatus) {
                    booking.paymentStatus = params.paymentStatus;
                }
                if (params.depositStatus) {
                    booking.depositStatus = params.depositStatus;
                }
            } else if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
                booking.condoId = session.user.condo.id;
                booking.userId = session.userId;
            }

            // Only support for CM and the resident user.
            // Move validate user unit to booking service.
            return BookingService.createBooking(booking, fromCM, bookForCondo, urlCallback)
                .then((object) => {
                    if (object != null) {
                        res.status(HttpStatus.OK);
                        res.json(object);
                    } else {
                        res.status(HttpStatus.BAD_REQUEST);
                        res.json(StateModel.stateError(ErrorCode.RESOURCE.SAVE_FAILED.CODE, ErrorCode.RESOURCE.SAVE_FAILED.MESSAGE));
                    }
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>|Promise<U|U>}
     */
    public static cancel(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let bookingId = BookingModel.getString(req.params.id, "");
            let session = res.locals.session || SessionModel.empty();
            let fromCM: boolean = false;
            if (session.roleId === ROLE.CONDO_MANAGER) {
                fromCM = true;
            }
            return BookingService.cancelById(bookingId, fromCM)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.NO_CONTENT);
                        res.end();
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static validate(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session: SessionModel = res.locals.session || SessionModel.empty();
        let booking: BookingModel = BookingModel.fromRequest(req.body);
        booking.userId = session.userId;
        booking.condoId = session.roleId === ROLE.CONDO_MANAGER ? session.user.condoManager.id : session.user.condo.id;

        // Only support for CM and the resident user.
        // Move validate user unit to booking service.
        return BookingService.validateBooking(booking, true)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Confirm payment status for condo pay by cash booking by mobile
     * @param req
     * @param res
     * @param next
     */
    public static confirmPayment(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let id = req.params.id || null;

        return BookingService.confirmPayment(id)
            .then(response => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(id));
            })
            .catch(err => {
                next(err);
            });
    }

    // reset deposit counter for deposit status DUE on Firebase and Redis
    public static resetDepositCounter(req: express.Request, res: express.Response, next: express.NextFunction) {
        return BookingService.resetCounterDeposit()
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
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
     * @returns {Promise<U>|Promise<U|U>}
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let bookingId = BookingModel.getString(req.params.id);
            let params = req.body || {};
            let booking: BookingModel = BookingModel.fromRequest(params);
            booking.id = bookingId;
            if (req.body.note === "") {
                booking.note = "";
            }
            if (params.paymentStatus) {
                booking.paymentStatus = params.paymentStatus;
            }
            if (params.depositStatus) {
                booking.depositStatus = params.depositStatus;
            }
            let urlCallback = `${req.protocol}://${req.get("host")}`;

            return BookingService.editBooking(booking, true, urlCallback)
                .then((model) => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful());
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>|Promise<U|U>}
     */
    public static updateNote(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let bookingId = BookingModel.getString(req.params.id);
            let model = BookingModel.fromRequest(req.body);
            model.id = bookingId;
            if (req.body.note === "") {
                model.note = "";
            }
            return BookingService.editBookingNote(model)
                .then((model) => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful());
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>|Promise<U|U>}
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let bookingId = BookingModel.getString(req.params.id, "");
            return BookingService.delete(bookingId)
                .then((object) => {
                    res.status(HttpStatus.NO_CONTENT);
                    res.end();
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }
}

export default BookingHandler;
