import * as Promise from "bluebird";
import {Range} from "moment-range";
import * as momentTz from "moment-timezone";
import {ErrorCode, HttpStatus, MomentRange, Logger, Utils} from "../libs";
import {BaseService} from "./base.service";
import {BookingService} from "./";
import {
    BookingItemRepository,
    FacilityRepository,
    SlotDurationRepository,
    SlotRepository,
    SlotRestrictionRepository,
    SlotRuleRepository,
    SlotSuspensionRepository,
    SlotTimeRepository,
    UserRepository,
    BookingSpecialPricesRepository,
    SlotSharingResourceRepository
} from "../data";
import {
    BaseModel,
    BookingModel,
    CollectionWrap,
    ExceptionModel,
    FacilityModel,
    FacilityTypeModel,
    QuotaModel,
    SlotDurationModel,
    SlotDurationTypeModel,
    SlotModel,
    SlotRestrictionTypeModel,
    SlotSuspensionModel,
    SlotTimeItemModel,
    SlotTimeModel,
    SlotTypeModel,
    UserModel,
    BookingSpecialPriceTypeModel
} from "../models";
import {
    DELETE_STATUS,
    ENABLE_STATUS,
    TIME_ZONE,
    SLOT_RESTRICTION,
    FREQUENCY_RESTRICTION_TYPE_ITEM,
    SLOT_TIME_TYPE,
    SLOT_TYPE
} from "../libs/constants";
import {SLOT_TABLE_SCHEMA, SLOT_SUSPENSION_TABLE_SCHEMA, BOOKING_ITEM_TABLE_SCHEMA} from "../data/sql/schema";
import Redis from "../data/redis/redis";
import * as Schema from "../data/sql/schema";

export class FacilityService extends BaseService<FacilityModel, typeof FacilityRepository> {
    private types: CollectionWrap<FacilityTypeModel>;
    private slotTypes: CollectionWrap<SlotTypeModel>;
    private slotDurationTypes: CollectionWrap<SlotDurationTypeModel>;
    private slotRestrictionTypes: CollectionWrap<SlotRestrictionTypeModel>;
    private slotTimeTypesSample: SlotTimeItemModel[];

    constructor() {
        super(FacilityRepository);
    }

    public getTypes(): Promise<CollectionWrap<FacilityTypeModel>> {
        if (this.types != null) {
            return Promise.resolve(this.types);
        } else {
            return FacilityRepository.getTypes().tap((object) => {
                this.types = object;
            });
        }
    }

    public getSlotType(): Promise<CollectionWrap<SlotTypeModel>> {
        if (this.slotTypes != null) {
            return Promise.resolve(this.slotTypes);
        } else {
            return SlotRepository.getTypes().tap((object) => {
                this.slotTypes = object;
            });
        }
    }

    /**
     * Function get list slot time types sample default, will be display on portal at create new slot for facility.
     *
     * @returns {Promise<SlotTimeItemModel[]>}
     */
    public getSlotTimeTypeSample(): Promise<SlotTimeItemModel> {
        if (this.slotTimeTypesSample != null) {
            // return Promise.resolve(this.slotTimeTypesSample);
        } else {
            // return SlotTimeItemRepository.search().tap((object) => {
            //     this.slotTimeTypesSample = object;
            // });
            return null;
        }
    }

    public getSlotDurationType(): Promise<CollectionWrap<SlotDurationTypeModel>> {
        if (this.slotDurationTypes != null) {
            return Promise.resolve(this.slotDurationTypes);
        } else {
            return SlotRepository.getDurationTypes().tap((object) => {
                this.slotDurationTypes = object;
            });
        }
    }

    public getSlotRestrictionType(): Promise<CollectionWrap<SlotRestrictionTypeModel>> {
        if (this.slotRestrictionTypes != null) {
            return Promise.resolve(this.slotRestrictionTypes);
        } else {
            return SlotRepository.getRestrictionTypes().tap((object) => {
                this.slotRestrictionTypes = object;
            });
        }
    }

    public checkCurrentQuota(params: any, related: string[] = [], filters: string[] = []): Promise<any> {
        let timezone = params.timezone;
        let currentDate = momentTz.tz(new Date(), timezone).startOf("date");
        let facilityId = params.facilityId;
        let bookingDate: momentTz.Moment = params.date != null ? BaseModel.getDate(params.date) : null;
        let slots: SlotModel[] = [];
        let user: UserModel;
        let facilityType: string;

        return Promise.resolve()
            .then(() => UserRepository.findOne(params.userId, ["unit.floor", "condo"]))
            .then((object) => {
                user = object;
            })
            .then(() => FacilityRepository.findOne(facilityId, ["restrictions"]))
            .then((facilityDto) => {
                if (facilityDto != null && facilityDto.restrictions != null && facilityDto.restrictions.length > 0) {
                    facilityType = facilityDto.slotTypeId;
                    return Promise.map(facilityDto.restrictions, rule => {
                        if (rule.bookingNoLimit || (rule.bookingQuantity != null && rule.bookingQuantity === 0)) {
                            Logger.info("No restriction was applied");
                            let quota = new QuotaModel();
                            quota.type = rule.slotTimeTypeId;
                            quota.level = rule.restrictionLevel;
                            quota.max = 0;
                            quota.current = 0;
                            quota.remain = 0;
                            quota.isNoLimit = true;
                            quota.unit = rule.bookingRestrictUnitId;
                            return quota;
                        }
                        let targetLevel = "";
                        switch (rule.restrictionLevel) {
                            case SLOT_RESTRICTION.LEVEL_CONDO:
                                targetLevel = user.condo.id;
                                break;
                            case SLOT_RESTRICTION.LEVEL_BLOCK:
                                targetLevel = user.unit.floor.blockId;
                                break;
                            case SLOT_RESTRICTION.LEVEL_UNIT:
                                targetLevel = user.unit.id;
                                break;
                            default:    // Level: user
                                targetLevel = user.id;
                        }

                        let date = momentTz.tz(bookingDate, timezone);
                        let value: string;
                        let startTime: number;
                        let endTime: number;
                        let expire: number;
                        switch (rule.bookingRestrictUnitId) {
                            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_DAY:
                                value = date.get("dayOfYear").toString();
                                expire = date.endOf("day").unix();
                                startTime = date.startOf("day").valueOf();
                                endTime = date.endOf("day").valueOf();
                                break;
                            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_MONTH:
                                value = date.get("month").toString();
                                expire = date.endOf("month").unix();
                                startTime = date.startOf("month").valueOf();
                                endTime = date.endOf("month").valueOf();
                                break;
                            case FREQUENCY_RESTRICTION_TYPE_ITEM.TWO_WEEKS:
                                value = (Math.ceil(date.isoWeek() / 2)).toString();
                                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((2 - (date.isoWeek() % 2)) % 2);
                                startTime = (expire - 60 * 60 * 24 * 7 * 2) * 1000 + 1;
                                endTime = expire * 1000;
                                break;
                            case FREQUENCY_RESTRICTION_TYPE_ITEM.THREE_WEEKS:
                                value = (Math.ceil(date.isoWeek() / 3)).toString();
                                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((3 - (date.isoWeek() % 3)) % 3);
                                startTime = (expire - 60 * 60 * 24 * 7 * 3) * 1000 + 1;
                                endTime = expire * 1000;
                                break;
                            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_YEAR:
                                value = date.get("year").toString();
                                expire = date.endOf("year").unix();
                                startTime = date.startOf("year").valueOf();
                                endTime = date.endOf("year").valueOf();
                                break;
                            default:
                                value = date.isoWeek().toString();
                                expire = date.endOf("isoWeek").unix();
                                startTime = date.startOf("isoWeek").valueOf();
                                endTime = date.endOf("isoWeek").valueOf();
                        }
                        let kind = rule.slotTimeTypeId;
                        let currentKey: string = Redis.getBookingRateLimiterKey("facility", rule.facilityId, kind, rule.restrictionLevel, targetLevel, rule.bookingRestrictUnitId, value);

                        return Redis.getClient().getAsync(currentKey)
                            .then((val) => {
                                let total = 0;
                                if (val != null) {
                                    let num = Number.parseInt(val);
                                    total = isNaN(num) ? 0 : num;
                                }

                                Logger.info(`Limiter for ${currentKey}, value ${total}, max ${rule.bookingQuantity}`);
                                let quota = new QuotaModel();
                                quota.type = rule.slotTimeTypeId;
                                quota.level = rule.restrictionLevel;
                                quota.max = rule.bookingQuantity;
                                quota.current = total;
                                quota.remain = quota.max <= quota.current ? 0 : (quota.max - quota.current);
                                quota.isNoLimit = rule.bookingNoLimit;
                                quota.startTime = new Date(startTime);
                                quota.endTime = new Date(endTime);
                                quota.unit = rule.bookingRestrictUnitId;

                                return quota;
                            });
                    });
                }
                return [];
            })
            .then(quotas => {
                let result: QuotaModel[] = [];
                result.push(QuotaModel.summaryQuotas(SLOT_TIME_TYPE.TOTAL, quotas));
                if (facilityType === SLOT_TYPE.PEAK) {
                    result.push(QuotaModel.summaryQuotas(SLOT_TIME_TYPE.PEAK, quotas));
                    result.push(QuotaModel.summaryQuotas(SLOT_TIME_TYPE.OFF_PEAK, quotas));
                }
                return result;
            });
    }

    public checkQuotaExempt(params: any): Promise<QuotaModel> {
        let quota = new QuotaModel();
        return Promise.resolve()
        .then(() => {
            if (!params.facilityId || !params.date || !params.startTime || !params.endTime) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return FacilityRepository.findOne(params.facilityId);
        })
        .then(facility => {
            let eventStartDate = Utils.combineDateTimeString(params.date, params.startTime, params.timezone);
            let eventEndDate = Utils.combineDateTimeString(params.date, params.endTime, params.timezone);
            let bookingDate = momentTz.tz(new Date(), params.timezone);
            quota.isExempt = facility.allowBeforeEndTime ? (eventEndDate.unix() - bookingDate.unix()) < facility.quotaExempt : (eventStartDate.unix() - bookingDate.unix()) < facility.quotaExempt;
            return quota;
        });
    }

    /**
     * Function check and get list durations available support for booking facility.
     *
     * @param params
     * @returns {Promise<Array<SlotDurationModel>>}
     */
    public checkSessionAvailability(params: any): Promise<SlotDurationModel[]> {
        let timezone = params.timezone;
        let currentDate = momentTz.tz(new Date(), timezone);
        let facilityId = params.facilityId || null;
        let bookingDate = momentTz.tz(params.date, timezone);
        let slots: SlotModel[] = [];
        let durationsCombine: SlotDurationModel[] = [];
        let facility: FacilityModel;

        return Promise.resolve()
            .then(() => {
                if (!timezone || !facilityId || !bookingDate) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return FacilityRepository.findOne(facilityId)
                .then(object => {
                    facility = object;
                    // Get list slots by of facility.
                    return SlotRepository.search(params, ["rule", "partnerSlots"]);
                });
            })
            .then((slot) => {
                if (slot != null && slot.total > 0) {
                    slots = slot.data;

                    let arr = slot.data.map(item => item.id);

                    params.isoWeekday = bookingDate.isoWeekday();
                    params.slotIds = arr;

                    // get all slot time and duration follow weekday
                    return SlotTimeRepository.search(params, ["durations"]);
                }

            })
            .then(data => {
                let slotTimes: SlotTimeModel[] = data.data;
                return Promise.each(slots, (slot => {
                    let minStartTime: momentTz.Moment;
                    let maxEndTime: momentTz.Moment;
                    let start: momentTz.Moment = momentTz.tz(bookingDate, timezone).startOf("date");
                    let end: momentTz.Moment = momentTz.tz(bookingDate, timezone).startOf("date");
                    let slotSuspensions: SlotSuspensionModel[];

                    slotTimes.forEach(slotTime => {
                        if (slot.id === slotTime.slotId) {
                            if (!minStartTime || BaseModel.getTimeInterval(slotTime.minStartTime).isBefore(minStartTime)) {
                                minStartTime = BaseModel.getTimeInterval(slotTime.minStartTime);
                            }
                            if (!maxEndTime || BaseModel.getTimeInterval(slotTime.maxEndTime).isAfter(maxEndTime)) {
                                maxEndTime = BaseModel.getTimeInterval(slotTime.maxEndTime);
                            }
                        }
                    });
                    start.add(minStartTime.get("h"), "h").add(minStartTime.get("m"), "m");
                    if (maxEndTime.isAfter(minStartTime)) {
                        end.add(maxEndTime.get("h"), "h").add(maxEndTime.get("m"), "m");
                    } else {
                        end.add(maxEndTime.get("h") + 24, "h").add(maxEndTime.get("m"), "m");
                    }
                    let relatedSlotIds = slot.partnerSlotIds;
                    relatedSlotIds.push(slot.id);
                    return SlotSuspensionRepository.getSuspensionByDuration(relatedSlotIds, start, end)
                    .then(result => {
                        slotSuspensions = result;
                        return BookingItemRepository.getBookingItemByDuration(relatedSlotIds, start, end, null);
                    })
                    .then(result => {
                        slotTimes.forEach(slotTime => {
                            if (slot.id === slotTime.slotId) {
                                slotTime.durations.forEach(duration => {
                                    duration.slotId = slot.id;
                                    let start = BookingModel.getTimeInterval(duration.startTime);
                                    let end = BookingModel.getTimeInterval(duration.stopTime);

                                    let eventStartDate: momentTz.Moment = momentTz.tz(bookingDate, timezone).startOf("date");
                                    eventStartDate.add(start.get("h"), "h").add(start.get("m"), "m");

                                    let eventEndDate: momentTz.Moment = momentTz.tz(bookingDate, timezone).startOf("date");
                                    if (end.isAfter(start)) {
                                        eventEndDate.add(end.get("h"), "h").add(end.get("m"), "m");
                                    } else {
                                        eventEndDate.add(end.get("h") + 24, "h").add(end.get("m"), "m");
                                    }

                                    let isAfter = eventStartDate.isAfter(currentDate);
                                    if (facility && facility.allowBeforeEndTime) {
                                        isAfter = eventEndDate.isAfter(currentDate);
                                    }

                                    let daysInAdvance = slot.rule.slotAvailableAdvance;
                                    let advanceDate = momentTz.tz(new Date(), timezone).add(daysInAdvance, "d").startOf("date");

                                    // Check booking date available in the [days in advance] value.
                                    duration.isAvailable = isAfter && (params.isAdmin || eventStartDate <= advanceDate);

                                    slotSuspensions.forEach(slotSuspension => {
                                        if (duration.isAvailable && eventStartDate.isBefore(slotSuspension.endDate) && eventEndDate.isAfter(slotSuspension.startDate)) {
                                            duration.isAvailable = false;
                                        }
                                    });

                                    result.forEach(item => {
                                        if (duration.isAvailable && eventStartDate.isBefore(item.eventEndDate) && eventEndDate.isAfter(item.eventStartDate)) {
                                            duration.isAvailable = false;
                                        }
                                    });

                                    durationsCombine.push(duration);
                                });
                            }
                        });
                    });
                }));
            })
            .then(() => {
                // Remove the duplicate items inside list.
                if (durationsCombine.length > 0) {
                    durationsCombine.sort(function (a, b) {
                        return a.startTime < b.startTime ? -1 : (a.startTime > b.startTime ? 1 : 0);
                    });

                    for (let index = 0; index < durationsCombine.length; index++) {
                        let item = durationsCombine[index];
                        let slotIdsAvailable: string[] = [];

                        if (item.isAvailable) {
                            slotIdsAvailable.push(item.slotId);
                        }

                        // Sort all item has the same duration.
                        for (let indexBubble = durationsCombine.length - 1; indexBubble > index; indexBubble--) {
                            let itemBubble = durationsCombine[indexBubble];

                            if (item.startTime === itemBubble.startTime && item.stopTime === itemBubble.stopTime
                                && item.slotId !== itemBubble.slotId) {
                                durationsCombine.splice(indexBubble, 1);
                                if (itemBubble.isAvailable) {
                                    slotIdsAvailable.push(itemBubble.slotId);
                                }
                            }
                        }

                        item.slotsAvailable = [];
                        // Filter and set slot available with duration section.
                        slots.forEach(i => {
                            item.slotsAvailable.push({...i});
                        });

                        item.slotsAvailable.forEach(slot => {
                            slot.isAvailable = slotIdsAvailable.indexOf(slot.id) > -1;
                        });

                        item.isAvailable = slotIdsAvailable.length > 0;
                    }
                }

                return durationsCombine;
            })
            .catch(err => {
                Logger.error(err.message, err);
                return [];
            });
    }

    public searchFacilities(searchParams: any, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<FacilityModel>> {
        return FacilityRepository.search(searchParams, offset, limit, related, filters);
    }

    public searchSessions(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<SlotDurationModel>> {
        return SlotDurationRepository.search(params, offset, limit, related, filters);
    }

    public searchSlotTimes(params: any, related = [], filters = []): Promise<CollectionWrap<SlotTimeModel>> {
        return SlotTimeRepository.search(params, related, filters);
    }

    public searchSlots(params: any, related = [], filters = []): Promise<CollectionWrap<SlotModel>> {
        return SlotRepository.search(params, related, filters);
    }

    /**
     * Function get slot detail.
     *
     * @param slotId
     * @param related
     * @param filters
     * @returns {Promise<SlotModel>}
     */
    public getSlotDetail(slotId: string, related = [], filters = []): Promise<SlotModel> {
        return SlotRepository.findOneByQuery(q => {
            q.where(SLOT_TABLE_SCHEMA.FIELDS.ID, slotId);
            q.where(SLOT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(SLOT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        }, related, filters);
    }

    public createFacility(model: FacilityModel, related: string[] = [], filters: string[] = []): Promise<FacilityModel> {
        return FacilityRepository.insert(model)
            .then(object => {
                if (model.restrictions != null && model.restrictions.length > 0) {
                    Promise.each(model.restrictions, item => {
                        item.facilityId = object.id;

                        SlotRestrictionRepository.insert(item)
                            .catch(err => {
                                Logger.error(err.message, err);
                            });
                    });
                }
                return object;
            })
            .then(object => {
                return FacilityRepository.findOne(object.id, related, filters);
            });
    }

    /**
     * Function update facility info.
     *
     * @param id
     * @param model
     * @returns {Promise<FacilityDto>}
     */
    public updateFacility(id: string, model: FacilityModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                // Check item existing.
                return FacilityRepository.findOne(id);
            })
            .then(item => {
                if (item == null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }

                model.id = id;

                return FacilityRepository.update(model);
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    public deleteFacility(facilityId: string): Promise<any> {
        let deletePromises = [];
        return this.findOne(facilityId, ["slots"])
        .then(facility => {
            facility.slots.forEach(slot => {
                deletePromises.push(this.deleteSlot(slot.id));
            });
            return Promise.all(deletePromises);
        })
        .then(() => {
            return this.delete(facilityId);
        });
    }
    /**
     * Function create new facility slot.
     *
     * @param model
     * @param related
     * @param filter
     * @returns {Promise<U>}
     */
    public createFacilitySlot(model: SlotModel, related: string[] = [], filter: string[] = []): Promise<SlotModel> {
        return Promise.resolve()
            .then(() => {
                return FacilityRepository.findOne(model.facilityId);
            })
            .then((object) => {
                if (object == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.FACILITY_DOES_NOT_EXIST.CODE,
                        ErrorCode.RESOURCE.FACILITY_DOES_NOT_EXIST.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                // return this.getSlotDurationType();
                // Save rule for slot
                return SlotRuleRepository.saveRuleForSlot(model.rule);
            })
            .then((rule) => {
                model.slotRuleId = rule.id;
                // Save slot info.
                return SlotRepository.insert(model);
            })
            .tap((slot) => {
                if (model.specialPrices && model.specialPrices.length > 0) {
                    return Promise.each(model.specialPrices, item => {
                        item.slotId = slot.id;
                        item.facilityId = model.facilityId;
                        return BookingSpecialPricesRepository.insert(item);
                    });
                }
            })
            .tap((slot) => {
                if (model.slotSharingResources && model.slotSharingResources.length > 0) {
                    return Promise.each(model.slotSharingResources, item => {
                        item.slotId == null ? item.slotId = slot.id : item.partnerSlotId = slot.id;
                        return SlotSharingResourceRepository.insert(item);
                    });
                }
            })
            .then((slot) => {
                model.id = slot.id;
                // Save slot times (duration type, durations,...) for slot.
                return Promise.each(model.slotTime, item => {
                    item.slotId = slot.id;
                    return SlotTimeRepository.saveTimesForSlot(item);
                });
            })
            .then(() => {
                return SlotRepository.findOne(model.id, related, filter);
            })
            .then((object) => {
                return object;
            })
            .catch(err => {
                throw err;
            });
    }

    /**
     * Function update slot of facility.
     *
     * @param model
     * @param related
     * @param filter
     * @returns {Promise<U>}
     */
    public updateSlot(model: SlotModel, related: string[] = [], filter: string[] = []): Promise<SlotModel> {
        // TODO: Not implement.
        return null;
    }

    /**
     * Function delete slot.
     *
     * @param slotId
     * @returns {Promise<FacilityDto>}
     */
    public deleteSlot(slotId: string): Promise<any> {
        let slot: SlotModel;
        return Promise.resolve()
            .then(() => {
                // Check item existing.
                return SlotRepository.findOne(slotId, ["slotTime", "specialPrices"]);
            })
            .then(item => {
                if (item == null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
                slot = item;
                return SlotRepository.deleteLogic(slotId);
            })
            .then(() => {
                let deletePromises = [];
                deletePromises.push(SlotRuleRepository.forceDelete(slot.slotRuleId));
                slot.specialPrices.forEach(price => {
                    deletePromises.push(BookingSpecialPricesRepository.forceDelete(price.id));
                });
                deletePromises.push(this.deleteSlotSharingResources(slot.id));
                slot.slotTime.forEach(item => {
                    deletePromises.push(SlotTimeRepository.forceDelete(item.id));
                });
                return Promise.all(deletePromises);
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    private checkSlotTime(times: SlotTimeModel[] = [], durationType: string) {
        if (times.length > 0) {
            let curr: SlotTimeModel = times[0];
            // this.checkSessions(curr.sections, durationType);
            for (let i = 1; i < times.length; i++) {
                let next: SlotTimeModel = times[i];
                // let currRange: Range = MomentRange.range(SlotTimeModel.getTimeInterval(curr.startTime), SlotTimeModel.getTimeInterval(curr.stopTime));
                // let nextRange: Range = MomentRange.range(SlotTimeModel.getTimeInterval(next.startTime), SlotTimeModel.getTimeInterval(next.stopTime));
                // if (currRange.overlaps(nextRange)) {
                //     throw new ExceptionModel(
                //         ErrorCode.RESOURCE.SLOT_TIME_OVERLAP.CODE,
                //         ErrorCode.RESOURCE.SLOT_TIME_OVERLAP.MESSAGE,
                //         false,
                //         HttpStatus.BAD_REQUEST,
                //     );
                // }
                // curr = next;
                // this.checkSessions(curr.sections, durationType);
            }
        }
    }

    private checkSessions(sessions: SlotDurationModel[] = [], durationType: string) {
        if (sessions.length > 0) {
            let curr: SlotDurationModel = sessions[0];
            for (let i = 1; i < sessions.length; i++) {
                let next: SlotDurationModel = sessions[i];
                let currRange: Range = MomentRange.range(SlotDurationModel.getTimeInterval(curr.startTime), SlotDurationModel.getTimeInterval(curr.stopTime));
                let nextRange: Range = MomentRange.range(SlotDurationModel.getTimeInterval(next.startTime), SlotDurationModel.getTimeInterval(next.stopTime));

                if (currRange.overlaps(nextRange)) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.SLOT_SESSION_OVERLAP.CODE,
                        ErrorCode.RESOURCE.SLOT_SESSION_OVERLAP.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                // TODO: Check durationType
                curr = next;
            }
        }
    }

    public listSuspension(params: any, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<SlotSuspensionModel>> {
        return SlotSuspensionRepository.search(params, offset, limit, ["facility", "slot"], filters);
    }

    public getSuspension(id: string): Promise<SlotSuspensionModel> {
        return SlotSuspensionRepository.findOne(id, ["facility", "slot"]);
    }

    public removeSuspension(id: string): Promise<boolean> {
        return SlotSuspensionRepository.forceDelete(id);
    }

    public editSuspension(model: SlotSuspensionModel): Promise<SlotSuspensionModel> {
        return Promise.resolve()
            .then(() => {
                return SlotSuspensionRepository.update(model);
            })
            .then(() => {
                return SlotSuspensionRepository.findOne(model.id, ["facility", "slot"]);
            });
    }

    public createSuspension(model: SlotSuspensionModel): Promise<SlotSuspensionModel> {
        return Promise.resolve()
            .then(() => {
                return SlotRepository.findOneByQuery(q => {
                    q.where(SLOT_TABLE_SCHEMA.FIELDS.ID, model.slotId);
                    q.andWhere(SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID, model.facilityId);
                    q.andWhere(SLOT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                    q.andWhere(SLOT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
                });
            })
            .then((dtoModel) => {
                if (dtoModel == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return BookingItemRepository.findByQuery(q => {
                    q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID, model.slotId);
                    q.whereBetween(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_START_DATE, [model.startDate.toISOString(), model.endDate.toISOString()]);
                    q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                });
            })
            .then((dtoModel) => {
                if (dtoModel.length > 0) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.FACILITY_OCCUPIED.CODE,
                        ErrorCode.RESOURCE.FACILITY_OCCUPIED.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return SlotSuspensionRepository.insertGet(model, ["facility", "slot"]);
            });
    }

    public deleteSlotSharingResources(slotId: string) {
        return SlotSharingResourceRepository.deleteByQuery(q => {
            q.where(Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.SLOT_ID, slotId);
            q.orWhere(Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.PARTNER_SLOT_ID, slotId);
        });
    }

}

export default FacilityService;
