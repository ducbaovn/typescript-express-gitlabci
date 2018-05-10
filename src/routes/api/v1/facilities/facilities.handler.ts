import * as express from "express";
import * as momentTz from "moment-timezone";
import * as Promise from "bluebird";
import { BaseHandler } from "../base.handler";
import { FacilityService, UserUnitService } from "../../../../interactors";
import { PROPERTIES, ROLE, TIME_ZONE } from "../../../../libs/constants";
import { HttpStatus, ErrorCode } from "../../../../libs";
import { ExceptionModel, StateModel, FacilityModel, SlotModel, SessionModel, SlotSuspensionModel, UserUnitModel, BookingSpecialPriceTypeModel, SlotTimeTypeModel} from "../../../../models";

export class FacilityHandler extends BaseHandler {

    public static listSuspension(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let offset: number = FacilityModel.getNumber(req.query.offset, 0);
        let limit: number = FacilityModel.getNumber(req.query.limit, 20);
        let session = res.locals.session || SessionModel.empty();
        let params = req.query ? req.query : {};
        return FacilityService.listSuspension(params, offset, limit)
            .then((object) => {
                res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString());
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                res.status(HttpStatus.OK);
                res.json(object.data);
            })
            .catch(err => next(err));
    }

    public static getSuspension(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let facilityId: string = SlotModel.getString(req.params.id);
        let slotId: string = SlotModel.getString(req.params.slotId);
        let suspensionId: string = SlotModel.getString(req.params.suspensionId);
        return FacilityService.getSuspension(suspensionId)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => next(err));
    }

    public static createSuspension(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let facilityId: string = SlotModel.getString(req.params.id);
        let slotId: string = SlotModel.getString(req.params.slotId);
        let timezone: string = req.body.timezone;

        let model: SlotSuspensionModel = SlotSuspensionModel.fromRequest(req.body);
        model.id = undefined;
        model.targetId = "all";
        model.slotId = slotId;
        model.facilityId = facilityId;
        model.startDate = momentTz.tz(req.body.startDate, timezone);
        model.endDate = momentTz.tz(req.body.endDate, timezone);

        return FacilityService.createSuspension(model)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => next(err));
    }

    public static editSuspension(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let facilityId: string = SlotModel.getString(req.params.id);
        let slotId: string = SlotModel.getString(req.params.slotId);
        let suspensionId: string = SlotModel.getString(req.params.suspensionId);
        let model: SlotSuspensionModel = SlotSuspensionModel.fromRequest(req.body);
        model.id = suspensionId;
        model.slotId = slotId;
        model.facilityId = facilityId;

        return FacilityService.editSuspension(model)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => next(err));
    }

    public static removeSuspension(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let facilityId: string = SlotModel.getString(req.params.id);
        let slotId: string = SlotModel.getString(req.params.slotId);
        let suspensionId: string = SlotModel.getString(req.params.suspensionId);
        return FacilityService.removeSuspension(suspensionId)
            .then((object) => {
                res.status(HttpStatus.NO_CONTENT);
                res.json(object);
            })
            .catch(err => next(err));
    }

    public static getQuotas(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session: SessionModel = res.locals.session || SessionModel.empty();
        let params: any = req.query;
        let facilityId: string = FacilityModel.getString(req.params.id, "");

        if (facilityId === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.NOT_FOUND.CODE,
                ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        params.facilityId = facilityId;
        params.userId = session.userId;

        return FacilityService.checkCurrentQuota(params)
            .then((object) => {
                res.status(HttpStatus.OK);
                res.json(object);
            })
            .catch(err => next(err));
    }

    public static checkQuotaExempt(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session: SessionModel = res.locals.session || SessionModel.empty();
            let params: any = req.query;
            params.facilityId = req.params.id;
            params.userId = session.userId;

            return FacilityService.checkQuotaExempt(params)
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    /**
     * Create new slot for facility.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>}
     */
    public static createSlot(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = SlotModel.getString(req.params.id);
            let slot: SlotModel = SlotModel.fromRequest(req.body, facilityId);

            return FacilityService.createFacilitySlot(slot, [], [])
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function update slot info.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>}
     */
    public static updateSlot(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = SlotModel.getString(req.params.id);
            let slotId: string = SlotModel.getString(req.params.slotId);
            let slot: SlotModel = SlotModel.fromRequest(req.body, facilityId);

            slot.id = slotId;

            return FacilityService.updateSlot(slot, [], [])
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(slotId));
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function delete the slot by id.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteSlot(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = SlotModel.getString(req.params.id, "");
            let slotId: string = SlotModel.getString(req.params.slotId, "");

            if (facilityId === "" || slotId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return FacilityService.deleteSlot(slotId)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(slotId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Create new facility for condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static createFacilities(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facility: FacilityModel = FacilityModel.fromRequest(req.body);

            if (!FacilityHandler.checkConstraintFacilityModel(facility)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return FacilityService.createFacility(facility, ["restrictions"])
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Function update facility.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static updateFacility(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId = req.params.id || "";
            let facility: FacilityModel = FacilityModel.fromRequest(req.body);

            if (facilityId === "" || !FacilityHandler.checkConstraintFacilityModel(facility)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return FacilityService.updateFacility(facilityId, facility)
                .then((result) => {
                    if (result != null && result.id != null) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.updateSuccessful(facilityId));
                    } else {
                        res.status(HttpStatus.BAD_REQUEST);
                        res.json(StateModel.stateError(ErrorCode.RESOURCE.SAVE_FAILED.CODE, ErrorCode.RESOURCE.SAVE_FAILED.MESSAGE));
                    }
                })
                .catch(err => {
                    next(err);
                });
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Function delete facility.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteFacility(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId = FacilityModel.getString(req.params.id, "");

            if (facilityId == null || facilityId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return FacilityService.deleteFacility(facilityId)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(facilityId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function support check durations available on all slot inside the facility support for booking facility.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static checkAvailableSession(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let params: any = req.query;
            params.isAdmin = session.roleId === ROLE.CONDO_MANAGER ? true : false;
            let facilityId: string = FacilityModel.getString(req.params.id, "");

            if (facilityId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            params.facilityId = facilityId;

            return FacilityService.checkSessionAvailability(params)
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.length.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, "0");
                    res.header(PROPERTIES.HEADER_LIMIT, object.length.toString(10));
                    res.json(object);
                })
                .catch(err => next(err));
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function get slot detai.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static getSlotDetail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = FacilityModel.getString(req.params.id, "");
            let slotId: string = FacilityModel.getString(req.params.slotId, "");

            if (facilityId === "" || slotId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return FacilityService.getSlotDetail(slotId, ["rule", "slotTime", "slotTime.timeItems", "slotTime.durations", "specialPrices", "partnerSlots.facility"], [])
                .then((object) => {
                    if (object != null && object.id !== "") {
                        res.status(HttpStatus.OK);
                        res.json(object);
                    } else {
                        return next(new ExceptionModel(
                            ErrorCode.RESOURCE.SLOT_DOES_NOT_EXIST.CODE,
                            ErrorCode.RESOURCE.SLOT_DOES_NOT_EXIST.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST));
                    }
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Function get list slots of facility.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static getSlots(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = FacilityModel.getString(req.params.id, "");

            if (facilityId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            let params: any = req.query || {};
            params.facilityId = facilityId;
            return FacilityService.searchSlots(params, ["rule", "slotTime", "slotTime.timeItems", "slotTime.durations", "partnerSlots.facility"], [])
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, params.offset);
                    res.header(PROPERTIES.HEADER_LIMIT, params.limit);
                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getFacility(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let facilityId: string = FacilityModel.getString(req.params.id, "");
            return Promise.resolve()
                .then(() => {
                    return FacilityService.findOne(facilityId, ["restrictions"], []);
                })
                .then((object) => {
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
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getFacilities(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session: SessionModel = res.locals.session || SessionModel.empty();
            let condoId: string = FacilityModel.getString(req.query.condoId, "");
            let offset: number = FacilityModel.getNumber(req.query.offset, 0);
            let limit: number = FacilityModel.getNumber(req.query.limit, 20);

            let params: any = req.query;
            params.condoId = condoId;
            if (session.roleId === ROLE.CONDO_MANAGER || session.roleId === ROLE.SYSTEM_ADMIN) {
                params.isAdmin = true;
            } else {
                params.isAdmin = false;
            }

            return Promise.resolve()
                .then(() => {
                    if (session.roleId === ROLE.OWNER || session.roleId === ROLE.TENANT) {
                        return UserUnitService.checkUserAndResident(params.condoId, session.userId);
                    }
                    return true;
                })
                .then(() => {
                    return FacilityService.searchFacilities(params, offset, limit, ["slots.rule"], [])
                        .then((object) => {
                            res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                            res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                            res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                            res.status(HttpStatus.OK);
                            res.json(object.data);
                        });
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getFacilityTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return FacilityService.getTypes()
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, "0");
                    res.header(PROPERTIES.HEADER_LIMIT, object.total.toString(10));
                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getSlotTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return FacilityService.getSlotType()
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, "0");
                    res.header(PROPERTIES.HEADER_LIMIT, object.total.toString(10));
                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Get all slot time type sample default.
     * Example: Normal hours, Peak 1, Peak 2,...
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<U>}
     */
    public static getSlotTimeTypesSample(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return FacilityService.getSlotTimeTypeSample()
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getSlotDurationTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return FacilityService.getSlotDurationType()
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, "0");
                    res.header(PROPERTIES.HEADER_LIMIT, object.total.toString(10));
                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getSlotRestrictionTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return FacilityService.getSlotRestrictionType()
                .then((object) => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));
                    res.header(PROPERTIES.HEADER_OFFSET, "0");
                    res.header(PROPERTIES.HEADER_LIMIT, object.total.toString(10));
                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => next(err));
        }
        catch (err) {
            next(err);
        }
    }

    public static getBookingSlotTimeTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let object = SlotTimeTypeModel.getAll();
            res.header(PROPERTIES.HEADER_TOTAL, object.length.toString(10));
            res.header(PROPERTIES.HEADER_OFFSET, "0");
            res.header(PROPERTIES.HEADER_LIMIT, object.length.toString(10));
            res.status(HttpStatus.OK);
            res.json(object);
        }
        catch (err) {
            next(err);
        }
    }

    public static getBookingSpecialPriceTypes(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let object = BookingSpecialPriceTypeModel.getAll();
            res.header(PROPERTIES.HEADER_TOTAL, object.length.toString(10));
            res.header(PROPERTIES.HEADER_OFFSET, "0");
            res.header(PROPERTIES.HEADER_LIMIT, object.length.toString(10));
            res.status(HttpStatus.OK);
            res.json(object);
        }
        catch (err) {
            next(err);
        }
    }

    // region Private Method
    /**
     * Function validate all fields into the model object.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFacilityModel(dataModel: FacilityModel): boolean {
        let result = false;

        if (dataModel != null) {
            if (dataModel.condoId != null && dataModel.condoId !== ""
                && dataModel.name != null && dataModel.name !== "") {
                result = true;
            }
        }

        return result;
    }

    // endregion
}

export default FacilityHandler;
