/**
 * Created by davidho on 2/12/17.
 */
import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import * as UUID from "uuid";
import * as _ from "lodash";
import Redis from "../data/redis/redis";
import {BaseService} from "./base.service";
import {
    BookingItemModel,
    BookingModel,
    CollectionWrap,
    ExceptionModel,
    SlotRestrictionModel,
    TransactionHistoryModel,
    UserModel,
    UserUnitModel,
    BookingSpecialPricesModel
} from "../models";
import {
    BookingItemRepository,
    BookingRepository,
    CondoRepository,
    SlotRepository,
    SlotSuspensionRepository,
    UserUnitRepository,
    UserRepository
} from "../data";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Mailer, Scheduler} from "../libs";
import {
    BOOKING_STATUS,
    DELETE_STATUS,
    DEPOSIT_STATUS,
    ENABLE_STATUS,
    FREQUENCY_RESTRICTION_TYPE_ITEM,
    NOTIFY_BOOKING_REMINDER,
    PAYMENT_STATUS,
    REPORT,
    ROLE,
    SCHEDULER_SCRIPT,
    SLOT_RESTRICTION,
    STATUS_REQUEST_USER,
    TIME_ZONE,
    TRANSACTION_ITEM_TYPE,
    BOOKING_SPECIAL_PRICE_TYPE,
    MOMENT_DATE_FORMAT,
    SLOT_TIME_TYPE,
} from "../libs/constants";
import {
    BOOKING_ITEM_TABLE_SCHEMA,
    BOOKING_TABLE_SCHEMA,
    USER_UNIT_TABLE_SCHEMA,
    TRANSACTION_HISTORY_TABLE_SCHEMA,
    ONLINE_FORM_REQUEST_TABLE_SCHEMA,
    ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA,
    ONLINE_FORM_CATEGORY_TABLE_SCHEMA,
    ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA,
    CONDO_TABLE_SCHEMA
} from "../data/sql/schema";
import {PushNotificationService, TransactionHistoryService, PaymentSourceService} from "./index";
import * as Schema from "../data/sql/schema";

export class BookingService extends BaseService<BookingModel, typeof BookingRepository> {
    constructor() {
        super(BookingRepository);
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<BookingModel>>}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<BookingModel>> {
        return BookingRepository.search(searchParams, offset, limit, related, filters);
    }

    private checkSuspension(booking: BookingModel): Promise<boolean> {
        return Promise.resolve()
            .then(() => {

            })
            .then(() => true);
    }

    public generateKey(booking: BookingModel, rule: any): any {
        let result = {};
        let targetLevel = "";

        switch (rule.restrictionLevel) {
            case SLOT_RESTRICTION.LEVEL_CONDO:
                targetLevel = booking.condoId;
                break;
            case SLOT_RESTRICTION.LEVEL_BLOCK:
                targetLevel = booking.blockId;
                break;
            case SLOT_RESTRICTION.LEVEL_UNIT:
                targetLevel = booking.unitId;
                break;
            default:    // Level: user
                targetLevel = booking.userId;
        }

        let date = booking.eventStartDate.clone();
        date.tz(booking.condo.timezone);
        let value: string;
        let expire: number;

        switch (rule.bookingRestrictUnitId) {
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_DAY:
                value = date.get("dayOfYear").toString();
                expire = date.endOf("day").unix();
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_MONTH:
                value = date.get("month").toString();
                expire = date.endOf("month").unix();
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.TWO_WEEKS:
                value = (Math.ceil(date.isoWeek() / 2)).toString();
                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((2 - (date.isoWeek() % 2)) % 2);
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.THREE_WEEKS:
                value = (Math.ceil(date.isoWeek() / 3)).toString();
                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((3 - (date.isoWeek() % 3)) % 3);
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_YEAR:
                value = date.get("year").toString();
                expire = date.endOf("year").unix();
                break;
            default:
                value = date.isoWeek().toString();
                expire = date.endOf("isoWeek").unix();
        }
        let kind = rule.slotTimeTypeId;
        let key: string = Redis.getBookingRateLimiterKey("facility", rule.facilityId, kind, rule.restrictionLevel, targetLevel, rule.bookingRestrictUnitId, value);
        result["key"] = key;
        result["expire"] = expire;
        return result;
    }

    /**
     *
     * @param booking
     * @param item
     * @param rules
     * @returns {Bluebird<boolean>}
     */
    private checkRateLimiter(booking: BookingModel, item: BookingItemModel, rules: SlotRestrictionModel[] = [], bookForCondo: boolean): Promise<boolean> {
        if (booking == null) {
            return Promise.resolve(false);
        }
        if (rules == null || rules.length === 0) {
            return Promise.resolve(false);
        }
        if (bookForCondo) {
            return Promise.resolve(true);
        }
        return Promise.resolve()
        .then(() => {
            if (booking.id) {
                return BookingRepository.findOne(booking.id, ["items.slot.rule", "items.facility", "user", "unit", "condo", "block"]);
            }
            return null;
        })
        .then(oldBooking => {
            return Promise.each(rules, rule => {
                let keyObject = {
                    oldKey: null,
                    oldExempt: false,
                    currentKey: null,
                    currentExempt: false
                };
                if (rule.bookingNoLimit) {
                    Logger.info("No restriction was applied");
                    return true;
                }
                if (item.slotTimeTypeId !== rule.slotTimeTypeId && rule.slotTimeTypeId !== SLOT_TIME_TYPE.TOTAL) {
                    return true;
                }
                if (oldBooking) {
                    keyObject.oldKey = this.generateKey(oldBooking, rule);
                    keyObject.oldExempt = oldBooking.items[0].facility.allowBeforeEndTime ? oldBooking.eventEndDate.unix() - oldBooking.createdDate.unix() < oldBooking.items[0].facility.quotaExempt : oldBooking.eventStartDate.unix() - oldBooking.createdDate.unix() < oldBooking.items[0].facility.quotaExempt;
                }
                keyObject.currentKey = this.generateKey(booking, rule);
                let current = momentTz();
                keyObject.currentExempt = booking.items[0].facility.allowBeforeEndTime ? booking.eventEndDate.unix() - current.unix() < booking.items[0].facility.quotaExempt : booking.eventStartDate.unix() - current.unix() < booking.items[0].facility.quotaExempt;

                return Promise.resolve()
                .then(() => {
                    let cacheKey: string = Redis.getCacheBookingRatemiterSetKey(booking.userId, item.slotId, item.eventStartDate.toISOString());
                    return Redis.getClient().multi()
                    .sadd(cacheKey, JSON.stringify(keyObject))
                    .expire(cacheKey, 300)
                    .execAsync()
                    .catch((err: Error) => {
                        Logger.error(err.message, err);
                    });
                })
                .then(() => {
                    if (keyObject.oldKey != null && keyObject.oldKey.key === keyObject.currentKey.key) {
                        return true;
                    }

                    if (keyObject.currentExempt) {
                        return true;
                    }

                    let multi = Redis.getClient().multi();
                    multi.get(keyObject.currentKey.key);
                    return multi.execAsync()
                    .then(object => {
                        let total = 0;
                        if (object != null && object.length > 0) {
                            let val = Number.parseInt(object[0]);
                            total = isNaN(val) ? 0 : val;
                        }
                        Logger.info(`Limiter for ${keyObject.currentKey.key}, value ${total}, max ${rule.bookingQuantity}`);
                        if (total >= rule.bookingQuantity) {
                            throw new ExceptionModel(
                                ErrorCode.RESOURCE.QUOTA_EXCEED.CODE,
                                ErrorCode.RESOURCE.QUOTA_EXCEED.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST,
                            );
                        }
                        return true;
                    });
                });
            });
        })
        .then(object => {
            return true;
        });
    }

    /**
     * Build booking detail By booking rule
     * @param booking
     * @returns {Promise<BookingModel>}
     */
    public buildBookingDetail(booking: BookingModel, validate: boolean, bookForCondo: boolean, fromCM: boolean): Promise<BookingModel> {
        // TODO: Should get timezone value from condo's information
        let timezone = booking.condo ? booking.condo.timezone : TIME_ZONE.TIME_ZONE_DEFAULT;
        let current = momentTz.tz(new Date(), timezone);
        let eventDate = momentTz.tz(new Date(), timezone).startOf("date");
        let depositAmount = 0;
        let paymentAmount = 0;
        let totalAmount = 0;
        let relatedSlotIds: string[];
        return Promise.resolve()
            .then(() => {
                return Promise.each(booking.items, (item) => {
                    let rules = [];

                    item.eventStartDate = momentTz.tz(item.eventStartDate, timezone).startOf("date").add(1, "s");
                    item.eventEndDate = momentTz.tz(item.eventEndDate, timezone).startOf("date");

                    return Promise.resolve()
                        .then(() => {
                            // Check slot exist and available.
                            return SlotRepository.findOne(item.slotId, ["rule", "facility.restrictions", "slotTime", "specialPrices", "partnerSlots"]);
                        })
                        .then((slot) => {
                            if (slot == null) {
                                throw new ExceptionModel(ErrorCode.RESOURCE.SLOT_DOES_NOT_EXIST.CODE,
                                    ErrorCode.RESOURCE.SLOT_DOES_NOT_EXIST.MESSAGE,
                                    false,
                                    HttpStatus.BAD_REQUEST);
                            }

                            let start = BookingModel.getTimeInterval(item.startTime);
                            let end = BookingModel.getTimeInterval(item.endTime);

                            item.eventStartDate.add(start.get("h"), "h").add(start.get("m"), "m");
                            if (end.isAfter(start)) {
                                item.eventEndDate.add(end.get("h"), "h").add(end.get("m"), "m");
                            } else {
                                item.eventEndDate.add(end.get("h") + 24, "h").add(end.get("m"), "m");
                            }

                            item.facility = slot.facility;
                            item.slotName = slot.name;
                            item.facilityId = slot.facilityId;

                            if (slot.facility != null) {
                                item.facilityName = slot.facility.name;
                                rules = slot.facility.restrictions;
                            }

                            if (slot.rule != null) {
                                let daysInAdvance = slot.rule.slotAvailableAdvance;

                                let difDays = item.eventStartDate.diff(eventDate, "d", false);
                                let isBefore = item.eventStartDate.isBefore(current);
                                let difSeconds = item.eventStartDate.diff(current, "s");

                                if (slot.facility != null && slot.facility.allowBeforeEndTime) {
                                    isBefore = item.eventEndDate.isBefore(current);
                                }
                                booking.isExempt = difSeconds < 0;
                                // Check booking date available in the [days in advance] value.
                                if (!fromCM && (difDays > daysInAdvance || isBefore)) {
                                    throw new ExceptionModel(
                                        ErrorCode.RESOURCE.BEHIND_ADVANDCE_BOOK_DAYS.CODE,
                                        ErrorCode.RESOURCE.BEHIND_ADVANDCE_BOOK_DAYS.MESSAGE,
                                        false,
                                        HttpStatus.BAD_REQUEST,
                                    );
                                }

                                item.depositAmount = slot.rule.depositAmount;
                                item.paymentAmount = slot.rule.paymentAmount;
                                if (slot.specialPrices && slot.specialPrices.length > 0) {
                                    let specialPrice = this.getSpecialPrice(item, slot.specialPrices, timezone);
                                    if (specialPrice != null) {
                                        item.paymentAmount = specialPrice.paymentAmount;
                                        item.depositAmount = specialPrice.depositAmount;
                                    }
                                }
                                item.totalAmount = item.depositAmount + item.paymentAmount;

                                // Sum total deposit and payment amount.
                                depositAmount += item.depositAmount > 0 ? item.depositAmount : 0;
                                paymentAmount += item.paymentAmount > 0 ? item.paymentAmount : 0;
                            }
                            if (booking.eventStartDate == null || item.eventStartDate.isAfter(booking.eventStartDate)) {
                                booking.eventStartDate = item.eventStartDate;
                            }

                            if (booking.eventEndDate == null || item.eventEndDate.isAfter(booking.eventEndDate)) {
                                booking.eventEndDate = item.eventEndDate;
                            }

                            // Get booking item with duration existing.
                            relatedSlotIds = slot.partnerSlotIds;
                            relatedSlotIds.push(slot.id);
                            return BookingItemRepository.getBookingItemByDuration(relatedSlotIds, item.eventStartDate, item.eventEndDate, booking.id);
                        })
                        .then((object) => {
                            if (object != null && object.length > 0) {
                                throw new ExceptionModel(
                                    ErrorCode.RESOURCE.FACILITY_OCCUPIED.CODE,
                                    ErrorCode.RESOURCE.FACILITY_OCCUPIED.MESSAGE,
                                    false,
                                    HttpStatus.BAD_REQUEST,
                                );
                            }
                            return SlotSuspensionRepository.getSuspensionByDuration(relatedSlotIds, item.eventStartDate, item.eventEndDate);
                        })
                        .then((object) => {
                            if (object != null && object.length > 0) {
                                throw new ExceptionModel(
                                    ErrorCode.RESOURCE.SLOT_SUSPENDED.CODE,
                                    ErrorCode.RESOURCE.SLOT_SUSPENDED.MESSAGE,
                                    false,
                                    HttpStatus.BAD_REQUEST,
                                );
                            }
                            return this.checkRateLimiter(booking, item, rules, bookForCondo);
                        });
                });
            })
            .then(() => {
                // Update total amount for booking.
                totalAmount = depositAmount + paymentAmount;
                if (!booking.depositStatus) {
                    booking.depositStatus = depositAmount > 0 ? DEPOSIT_STATUS.PENDING : DEPOSIT_STATUS.NOT_APPLICABLE;
                }
                if (validate) {
                    booking.depositAmount = depositAmount;
                    booking.paymentAmount = paymentAmount;
                    booking.totalAmount = totalAmount;
                } else if (booking.depositAmount !== depositAmount || booking.paymentAmount !== paymentAmount || booking.totalAmount !== totalAmount) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.WRONG_BILLING_DETAIL.CODE,
                        ErrorCode.PAYMENT.WRONG_BILLING_DETAIL.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return booking;
            });
    }

    /**
     * Function create new booking.
     *
     * @param booking
     * @param fromCM
     * @param bookForCondo
     * @param urlCallback
     * @returns {Promise<BookingModel>|Promise<BookingModel|U>}
     */
    public createBooking(booking: BookingModel, fromCM: boolean = false, bookForCondo: boolean = false, urlCallback?: string): Promise<BookingModel> {
        let user: UserModel;
        let receiptNumber: string;
        let isUpdate: boolean = false;
        return Promise.resolve()
            .then(() => this.validateBooking(booking, fromCM, bookForCondo, fromCM))
            .then(object => {
                if (!fromCM && !booking.condo.payByCash && !booking.user.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.MISSING_CUSTOMER_ID.CODE,
                        ErrorCode.PAYMENT.MISSING_CUSTOMER_ID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                booking.payByCash = fromCM ? true : booking.condo.payByCash;
                return BookingRepository.insert(object);
            })
            .then(bookingDto => {
                booking.id = bookingDto.id;
                if (fromCM || !booking.payByCash || booking.totalAmount === 0) {
                    // Starting payment charge
                    let transactionModel = new TransactionHistoryModel();

                    transactionModel.condoId = booking.condoId;
                    transactionModel.userId = booking.userId;
                    transactionModel.itemId = booking.id;
                    transactionModel.itemType = TRANSACTION_ITEM_TYPE.BOOK_FACILITY;
                    transactionModel.item = booking;
                    // Only charge on payment amount not charge on deposit amount.
                    transactionModel.amount = booking.paymentStatus === PAYMENT_STATUS.NOT_APPLICABLE ? 0 : booking.paymentAmount;
                    transactionModel.customerId = fromCM ? null : booking.user.customerId;
                    transactionModel.payByCash = booking.payByCash;
                    transactionModel.name = booking.items[0].facilityName;
                    transactionModel.firstName = booking.user ? booking.user.firstName : undefined;
                    transactionModel.lastName = booking.user ? booking.user.lastName : undefined;
                    transactionModel.unitNumber = booking.user ? booking.user.unitNumber : undefined;

                    return TransactionHistoryService.saveTransaction(transactionModel)
                        .then((object) => {
                            receiptNumber = object.transactionId;
                            booking.paymentStatus = transactionModel.amount > 0 ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.NOT_APPLICABLE;
                            return BookingRepository.update(booking);
                        });
                }
            })
            .then(() => this.saveBookingItem(booking))
            .then(() => this.updateBookingCondition(booking, bookForCondo))
            .then(() => BookingRepository.findOne(booking.id, ["items.slot.rule", "items.facility", "user", "unit", "condo", "block"]))
            .then(booking => {

                // Check booking date to send confirm to admin
                let sendAdmin = false;
                let nowStringDate = new Date();
                let currentDate = momentTz.tz(nowStringDate, booking.condo.timezone).format("YYYY-MM-DD");
                let eventStringDate = new Date(booking.eventStartDate);
                let eventDate = momentTz.tz(eventStringDate, booking.condo.timezone).format("YYYY-MM-DD");
                if (eventDate === currentDate) {
                    sendAdmin = true;
                }

                // Facility Booking - Confirmed
                if (booking.paymentAmount > 0) {
                    // need payment
                    if (booking.payByCash && !fromCM) {
                        Mailer.sendFacilityBookingPending(booking)
                            .catch(err => Logger.error(err.message, err));
                    } else {

                        Mailer.sendFacilityBookingConfirmed(booking, receiptNumber, sendAdmin)
                            .catch(err => Logger.error(err.message, err));
                    }
                } else {
                    // booking free
                    Mailer.sendFacilityBookingConfirmedNoPaymentNeeded(booking, sendAdmin)
                        .catch(err => Logger.error(err.message, err));
                }
                return booking;
            })
            .tap((booking) => {
                // Create schedule payment reminder. Daily reminder at 12PM
                try {
                    this.bookingReminder(booking.id, NOTIFY_BOOKING_REMINDER.DAILY_REMINDER, urlCallback)
                        .catch(err => Logger.error(err.message, err));

                    // Trigger counter deposit.
                    this.triggerCounterDeposit(booking, urlCallback);
                } catch (err) {
                    Logger.error(err.message, err);
                }
            })
            .catch(err => {
                // Action payment if failed -> remove booking item.
                if (booking.id != null) {
                    BookingRepository.forceDelete(booking.id);
                }
                throw err;
            });
    }

    /**
     * Function validate booking and get billing detail
     *
     * @param booking
     * @param validate
     * @param bookForCondo
     * @returns {Promise<BookingModel>|Promise<BookingModel|U>}
     */
    public validateBooking(booking: BookingModel, validate: boolean, bookForCondo: boolean = false, fromCM: boolean = false): Promise<BookingModel> {
        let userUnit: UserUnitModel;
        return Promise.resolve()
            .then(() => {
                if (!booking.condoId || !booking.items || booking.items.length === 0 || !booking.userId) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                // Check condo existing.
                return CondoRepository.findOne(booking.condoId, ["paymentGatewayAccount"]);
            })
            .then(condo => {
                if (condo == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                booking.condo = condo;
                if (bookForCondo) {
                    booking.condoId = condo.id;
                    // Generate receipt no for booking.
                    booking.receiptNo = Date.now().toString();

                    return true;
                }
                return UserUnitRepository.findByQuery(q => {
                    q.where(USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID, booking.condoId);
                    q.andWhere(USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, booking.userId);
                    q.andWhere(USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.andWhere(USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS, STATUS_REQUEST_USER.APPROVE);
                }, ["user", "unit.floor"])
                    .then(object => {
                        // Currently each user only have a unit in iCondo network.
                        // Maybe will be changed in the future.
                        if (object == null || object.length === 0) {
                            throw new ExceptionModel(
                                ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.CODE,
                                ErrorCode.PRIVILEGE.NOT_ALLOW_CONDO_LESS.MESSAGE,
                                false,
                                HttpStatus.FORBIDDEN,
                            );
                        }
                        userUnit = object[0];
                        if (!condo.payByCash) {
                            userUnit.user.unitNumber = userUnit.unit.unitNumber;
                            return PaymentSourceService.findOrCreate(userUnit.user, condo);
                        }
                        return null;
                    })
                    .then(paymentSource => {
                        userUnit.user.paymentSource = paymentSource;
                        userUnit.user.customerId = paymentSource ? paymentSource.customerId : null;
                        // Only support for CM and the resident user.
                        if (userUnit.isResident) {
                            booking.condoId = userUnit.condoId;
                            booking.floorId = userUnit.unit.floorId;
                            booking.unitId = userUnit.unitId;
                            booking.blockId = userUnit.unit.floor.blockId;
                            booking.user = userUnit.user;
                            // Generate receipt no for booking.
                            booking.receiptNo = Date.now().toString();

                            return true;
                        } else {
                            return Promise.reject(new ExceptionModel(
                                ErrorCode.PRIVILEGE.SUPPORT_ONLY_FOR_RESIDENT_USER.CODE,
                                ErrorCode.PRIVILEGE.SUPPORT_ONLY_FOR_RESIDENT_USER.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    });
            })
            .then(() => this.buildBookingDetail(booking, validate, bookForCondo, fromCM));
    }

    /**
     *
     * @param id
     * @returns {Bluebird<boolean>}
     */
    public cancelById(id: string, fromCM: boolean): Promise<boolean> {
        let booking: BookingModel;
        let current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_DEFAULT);

        return BookingRepository.findOneByQuery(q => {
            q.where(BOOKING_TABLE_SCHEMA.FIELDS.ID, id);
            q.where(BOOKING_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(BOOKING_TABLE_SCHEMA.FIELDS.IS_ENABLE, DELETE_STATUS.YES);
            /* ver: 1.3
            CM can delete any booking */
            if (!fromCM) {
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE, ">", new Date());
            }
        }, ["items.slot.rule", "items.facility.restrictions", "user", "unit", "condo", "block", "transaction"])
            .tap((object) => booking = object)
            .then(() => {
                if (booking == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }

                if (booking.items == null) {
                    return;
                }

                return Promise.map(booking.items, (item) => {
                    let rule = item.slot.rule;
                    if (!fromCM && rule.canNotCancel) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.CAN_NOT_CANCEL.CODE,
                            ErrorCode.RESOURCE.CAN_NOT_CANCEL.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                });
            })
            .then(() => {
                booking.paymentStatus = PAYMENT_STATUS.CANCELLED;
                booking.depositStatus = DEPOSIT_STATUS.CANCELLED;

                return BookingRepository.update(booking);
            })
            .then(object => {
                if (object == null) {
                    return false;
                } else {
                    let deleteLogic = {
                        is_deleted: true
                    };

                    return BookingItemRepository.updateByQuery(q => {
                        q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                        q.where(BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID, id);
                    }, deleteLogic)
                        .then(() => {
                            // Check booking date to send confirm to admin
                            let sendAdmin = false;
                            let nowStringDate = new Date();
                            let currentDate = momentTz.tz(nowStringDate, booking.condo.timezone).format("YYYY-MM-DD");
                            let eventStringDate = new Date(booking.eventStartDate);
                            let eventDate = momentTz.tz(eventStringDate, booking.condo.timezone).format("YYYY-MM-DD");
                            if (eventDate === currentDate) {
                                sendAdmin = true;
                            }
                            // send Facility Booking Cancelled
                            Mailer.sendFacilityBookingCancelled(booking, sendAdmin);
                            return true;
                        });
                }
            })
            .tap((result) => {
                if (result === true && booking != null && booking.items != null) {
                    try {
                        booking.items.forEach(item => {
                            let rule = item.slot.rule;
                            let advanceCancel: momentTz.Moment = momentTz.tz(booking.eventStartDate, TIME_ZONE.TIME_ZONE_DEFAULT);

                            advanceCancel.add(-rule.cancellationDays, "d");
                            advanceCancel.add(-rule.cancellationHours, "h");
                            advanceCancel.add(-rule.cancellationMinutes, "m");

                            if (current.isBefore(advanceCancel)) {
                                let restrictions = item.facility.restrictions;
                                let isExempt = item.facility.allowBeforeEndTime ? (item.eventEndDate.unix() - item.createdDate.unix()) < item.facility.quotaExempt : (item.eventStartDate.unix() - item.createdDate.unix()) < item.facility.quotaExempt;
                                if (restrictions != null && !isExempt) {
                                    restrictions.forEach(restriction => {
                                        if (restriction.slotTimeTypeId === SLOT_TIME_TYPE.TOTAL || restriction.slotTimeTypeId === item.slotTimeTypeId) {
                                            let key = this.extractRestrictionKey(restriction, booking);

                                            return Redis.getClient().decrAsync(key)
                                                .catch(err => Logger.error(err.message, err));
                                        }
                                    });
                                }
                            }
                        });
                    }
                    catch (err) {
                        Logger.error(err.message, err);
                    }
                }
            });
    }

    private extractRestrictionKey(restriction: SlotRestrictionModel, booking: BookingModel): string {
        if (restriction == null || booking == null) {
            return null;
        }
        if (restriction.bookingNoLimit || (restriction.bookingQuantity != null && restriction.bookingQuantity === 0)) {
            Logger.info("No restriction was applied");
            return null;
        }

        let targetLevel = "";
        switch (restriction.restrictionLevel) {
            case SLOT_RESTRICTION.LEVEL_CONDO:
                targetLevel = booking.condo != null ? booking.condo.id : booking.condoId;
                break;
            case SLOT_RESTRICTION.LEVEL_BLOCK:
                targetLevel = booking.block != null ? booking.block.id : booking.blockId;
                break;
            case SLOT_RESTRICTION.LEVEL_USER:
                targetLevel = booking.user != null ? booking.user.id : booking.userId;
                break;
            default:    // Level: user
                targetLevel = booking.unit != null ? booking.unit.id : booking.unitId;
        }
        let date = booking.eventStartDate.clone();
        date.tz(booking.condo.timezone);

        let value: string;
        let expire: number;

        switch (restriction.bookingRestrictUnitId) {
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_DAY:
                value = date.get("dayOfYear").toString();
                expire = date.endOf("day").unix();
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_MONTH:
                value = date.get("month").toString();
                expire = date.endOf("month").unix();
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.TWO_WEEKS:
                value = (Math.ceil(date.isoWeek() / 2)).toString();
                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((2 - (date.isoWeek() % 2)) % 2);
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.THREE_WEEKS:
                value = (Math.ceil(date.isoWeek() / 3)).toString();
                expire = date.endOf("isoWeek").unix() + 60 * 60 * 24 * 7 * ((3 - (date.isoWeek() % 3)) % 3);
                break;
            case FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_YEAR:
                value = date.get("year").toString();
                expire = date.endOf("year").unix();
                break;
            default:
                value = date.isoWeek().toString();
                expire = date.endOf("isoWeek").unix();
        }

        let kind = restriction.slotTimeTypeId;

        Logger.info(`Rate limiter: facility ${restriction.facilityId}, kind ${kind}, level ${restriction.restrictionLevel}, target ${targetLevel}, period ${value}`);

        return Redis.getBookingRateLimiterKey("facility", restriction.facilityId, kind, restriction.restrictionLevel, targetLevel, restriction.bookingRestrictUnitId, value);
    }

    private updateBookingCondition(booking: BookingModel, bookForCondo: boolean): Promise<any> {
        if (bookForCondo) {
            return Promise.resolve();
        }
        return Promise.each(booking.items, (section) => {
            section.bookingId = booking.id;
            let key = Redis.getCacheBookingRatemiterSetKey(booking.userId, section.slotId, section.eventStartDate.toISOString());
            return Redis.getClient().smembersAsync(key)
            .then((array) => {
                let multi = Redis.getClient().multi();
                if (array != null && array.length > 0) {
                    array.forEach(keyObj => {
                        keyObj = JSON.parse(keyObj);
                        if (!keyObj.currentExempt) {
                            multi.incr(keyObj.currentKey.key);
                            multi.expireat(keyObj.currentKey.key, keyObj.currentKey.expire);
                        }
                        if (keyObj.oldKey && !keyObj.oldExempt) {
                            multi.decr(keyObj.oldKey.key);
                        }
                    });
                }
                multi.del(key);
                return multi.execAsync();
            });
        });
    }

    private saveBookingItem(booking: BookingModel, isUpdate: boolean = false): Promise<any> {
        return Promise.each(booking.items, (section) => {
            section.bookingId = booking.id;
            if (!isUpdate) {
                return BookingItemRepository.insert(section);
            } else {
                return BookingItemRepository.update(section);
            }
        });
    }

    public update(searchParams, booking: BookingModel): Promise<any> {
        let id = searchParams.id || null;
        let paymentStatus = searchParams.paymentStatus || null;
        let depositStatus = searchParams.depositStatus || null;
        let eventEndDate = searchParams.eventEndDate || null;
        let updateParams = {};
        // not allow bulk update except update deposit status to Due
        if (!id && (booking.paymentStatus || booking.depositStatus !== DEPOSIT_STATUS.DUE)) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        if (booking.depositStatus) {
            updateParams[BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS] = booking.depositStatus;
        }

        if (booking.paymentStatus) {
            updateParams[BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS] = booking.paymentStatus;
        }

        return BookingRepository.updateByQuery(q => {
            if (id) {
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.ID, id);
            }
            if (paymentStatus) {
                q.whereIn(BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS, paymentStatus);
            }
            if (depositStatus) {
                q.whereIn(BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS, depositStatus);
            }
            if (eventEndDate) {
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.EVENT_END_DATE, "<", eventEndDate);
            }
        }, updateParams)
            .then(() => {
                return true;
            });
    }

    public confirmPayment(id: string): Promise<BookingModel> {
        let booking: BookingModel;
        let receiptNumber: string;
        if (!id) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return BookingRepository.findOne(id, ["items.slot.rule", "items.facility", "user", "unit", "condo", "block", "transaction"])
            .then(result => {
                booking = result;
                if (!booking.payByCash || booking.paymentStatus !== PAYMENT_STATUS.NEW) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.PAYMENT_INVALID.CODE,
                        ErrorCode.PAYMENT.PAYMENT_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                let transactionModel = new TransactionHistoryModel();
                transactionModel.condoId = booking.condoId;
                transactionModel.userId = booking.userId;
                transactionModel.itemId = booking.id;
                transactionModel.itemType = TRANSACTION_ITEM_TYPE.BOOK_FACILITY;
                transactionModel.item = booking;
                // Only charge on payment amount not charge on deposit amount.
                transactionModel.amount = booking.paymentAmount;
                transactionModel.customerId = null;
                transactionModel.payByCash = booking.payByCash;
                transactionModel.name = booking.items[0].facilityName;

                return TransactionHistoryService.saveTransaction(transactionModel);
            })
            .then(transaction => {
                receiptNumber = transaction.transactionId;
                booking.paymentStatus = PAYMENT_STATUS.PAID;

                return BookingRepository.update(booking);
            })
            .then(() => {
                return BookingRepository.findOne(id, ["items.slot.rule", "items.facility", "user", "unit", "condo", "block"]);
            })
            .then(booking => {
                // send Email 3C will be sent to user when booking confirm
                Mailer.sendFacilityBookingConfirmed(booking, receiptNumber, false);
                return booking;
            });
    }

    public updateDeposit(id: string, depositStatus: string): Promise<any> {
        let bookingInfo: BookingModel;
        let receiptNumber: string;
        let oldDepositStatus: string;
        return Promise.resolve()
            .then(() => {
                if (!id || !depositStatus) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                if (depositStatus !== DEPOSIT_STATUS.FORFEITED && depositStatus !== DEPOSIT_STATUS.RETURNED) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return BookingRepository.findOne(id, ["user", "items.slot.rule", "items.facility", "unit", "condo.paymentGatewayAccount", "block", "transaction"]);
            })
            .then(booking => {
                bookingInfo = booking;
                oldDepositStatus = booking.depositStatus;
                if (!bookingInfo.payByCash) {
                    booking.user.unitNumber = booking.unit.unitNumber;
                    return PaymentSourceService.findOrCreate(booking.user, booking.condo);
                }
                return null;
            })
            .then(paymentSource => {
                bookingInfo.user.paymentSource = paymentSource;
                bookingInfo.user.customerId = paymentSource ? paymentSource.customerId : null;
                if (!bookingInfo) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.BOOKING_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.BOOKING_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                if (!bookingInfo.payByCash && !bookingInfo.user.customerId) {
                    throw new ExceptionModel(
                        ErrorCode.PAYMENT.MISSING_CUSTOMER_ID.CODE,
                        ErrorCode.PAYMENT.MISSING_CUSTOMER_ID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                if (!bookingInfo.payByCash && depositStatus === DEPOSIT_STATUS.FORFEITED) {
                    let transactionModel = new TransactionHistoryModel();

                    transactionModel.condoId = bookingInfo.condoId;
                    transactionModel.userId = bookingInfo.userId;
                    transactionModel.itemId = bookingInfo.id;
                    transactionModel.itemType = TRANSACTION_ITEM_TYPE.BOOK_FACILITY;
                    transactionModel.item = bookingInfo;
                    // Charge deposit amount.
                    transactionModel.amount = bookingInfo.depositAmount;
                    transactionModel.customerId = bookingInfo.user.customerId;
                    transactionModel.name = bookingInfo.items[0].facilityName;
                    transactionModel.firstName = bookingInfo.user ? bookingInfo.user.firstName : undefined;
                    transactionModel.lastName = bookingInfo.user ? bookingInfo.user.lastName : undefined;
                    transactionModel.unitNumber = bookingInfo.user ? bookingInfo.user.unitNumber : undefined;

                    return TransactionHistoryService.saveTransaction(transactionModel);
                }
            })
            .then(object => {
                if (object) {
                    receiptNumber = object.transactionId;
                }
                let searchParams = {
                    id: id,
                    depositStatus: [DEPOSIT_STATUS.PENDING, DEPOSIT_STATUS.DUE]
                };
                let updateBookingStatus = new BookingModel();
                updateBookingStatus.depositStatus = depositStatus;
                return this.update(searchParams, updateBookingStatus);
            })
            .then(() => {
                return BookingRepository.findOne(id, ["items.slot.rule", "items.facility", "user", "unit", "condo", "block"]);
            })
            .then((booking) => {
                if (depositStatus === DEPOSIT_STATUS.RETURNED) {
                    // send mail Facilities Booking - Deposit Returned
                    Mailer.sendFacilityBookingDepositReturned(booking);
                } else if (depositStatus === DEPOSIT_STATUS.FORFEITED) {
                    // send mail Facilities Booking - Deposit Forfeited
                    Mailer.sendFacilityBookingDepositForfeited(booking, receiptNumber);
                }
                return booking;
            })
            .tap((booking) => {
                if (oldDepositStatus === DEPOSIT_STATUS.DUE) {
                    // Decrease counter deposit.
                    this.updateCounterDepositOnFirebase(booking.condoId, false)
                        .catch(err => Logger.error(err.message, err));
                }
            });
    }

    // this function should not go in REPOSITORY because this not return any MODEL_DTO,
    // it JOIN AROUND SOME TABLE and only serve for REPORT
    public reportBooking(condoId: string, startDate: string, endDate: string) {
        let query = `
            SELECT i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME} as key, COUNT(*) as value
            FROM ${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME} i JOIN ${BOOKING_TABLE_SCHEMA.TABLE_NAME} b
                ON i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID} = b.${BOOKING_TABLE_SCHEMA.FIELDS.ID}
            WHERE
                b.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_END_DATE} >= '${startDate}'
                AND b.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_END_DATE} < '${endDate}'
                AND b.${BOOKING_TABLE_SCHEMA.FIELDS.IS_DELETED} = ${DELETE_STATUS.NO}
                AND b.${BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
            GROUP BY i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}
        `;

        return BookingItemRepository.rawQuery(query);
    }

    // this function should not go in REPOSITORY because this not return any MODEL_DTO,
    // it JOIN AROUND SOME TABLE and only serve for REPORT
    public revenueGroupByName(condoId: string, startDate: string, endDate: string) {
        let query = `
            SELECT * FROM (
                SELECT ${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME} AS key, SUM(${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}) AS value
                FROM (
                    SELECT t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ID}, t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}, b.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}
                    FROM ${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} t
                        JOIN ${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME} b ON t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID} = b.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID}
                    WHERE
                        t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                        AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} >= '${startDate}'
                        AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} < '${endDate}'
                    GROUP BY t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ID}, t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}, b.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}
                ) t
                GROUP BY ${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}
                    UNION
                SELECT c.${ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME} AS key, SUM(t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}) AS value
                FROM ${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} t
                    JOIN ${ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} r ON t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID} = r.${ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID}
                    JOIN ${ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME} o ON r.${ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID} = o.${ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
                    JOIN ${ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME} c ON o.${ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID} = c.${ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
                WHERE
                    t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                    AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} >= '${startDate}'
                    AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} < '${endDate}'
                GROUP BY c.${ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}
            ) t
            WHERE value > 0;
        `;
        return BookingItemRepository.rawQuery(query);
    }

    // this function should not go in REPOSITORY because this not return any MODEL_DTO,
    // it JOIN AROUND SOME TABLE and only serve for REPORT
    public revenue(condoId: string, startDate: string, endDate: string) {
        let query = `
            SELECT SUM(t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}) AS value, 'facility' AS key
            FROM ${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} t
                JOIN ${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME} b ON t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID} = b.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID}
            WHERE
                t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} >= '${startDate}'
                AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} < '${endDate}'
            UNION
            SELECT SUM(t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT}) AS value, 'online form' AS key
            FROM ${TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} t
                JOIN ${ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} r ON t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID} = r.${ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID}
            WHERE
                t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} >= '${startDate}'
                AND t.${TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE} < '${endDate}';
        `;
        return BookingItemRepository.rawQuery(query);
    }

    // this function should not go in REPOSITORY because this not return any MODEL_DTO,
    // it JOIN AROUND SOME TABLE and only serve for REPORT
    public trending(condoId: string, timezone = TIME_ZONE.TIME_ZONE_DEFAULT, monthDuration = REPORT.MONTH_DURATION_TRENDING) {
        let report = [];
        let query = `
            SELECT i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}, to_char(i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE}, 'Mon YY') AS month, count(*)
            FROM ${BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME} i JOIN ${BOOKING_TABLE_SCHEMA.TABLE_NAME} b
                ON i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID} = b.${BOOKING_TABLE_SCHEMA.FIELDS.ID}
            WHERE
                b.${BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID} = '${condoId}'
                AND i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE} < now()
                AND date_trunc('month', i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.EVENT_END_DATE} at time zone '${timezone}') > date_trunc('month', (now() - interval '${monthDuration - 1} months') at time zone '${timezone}')
            GROUP BY i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME}, month
            ORDER BY i.${BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME};
        `;
        return BookingItemRepository.rawQuery(query)
            .then(result => {
                if (result && result.length) {
                    let header = ["Month"];
                    let groupName = _.groupBy(result, BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_NAME);
                    for (let facility in groupName) {
                        header.push(facility);
                    }
                    report.push(header);
                    for (let i = 0; i < REPORT.MONTH_DURATION_TRENDING; i++) {
                        let monthReport = [];
                        let month = momentTz.tz(new Date(), timezone).subtract(REPORT.MONTH_DURATION_TRENDING - 1 - i, "months").format("MMM YY");
                        monthReport.push(month);
                        for (let facility in groupName) {
                            let groupNameMonth = _.groupBy(groupName[facility], "month");
                            let count = groupNameMonth[month] ? groupNameMonth[month][0]["count"] : 0;
                            monthReport.push(count);
                        }
                        report.push(monthReport);
                    }
                }
                return report;
            });
    }

    /**
     * Check booking status and send notify reminder via push notification.
     *
     * @param bookingId
     * @param notifyType
     * @param urlCallback
     * @returns {Bluebird<U>}
     */
    public bookingReminder(bookingId: string, notifyType: any, urlCallback: string): Promise<any> {
        return Promise.resolve()
            .then(() => {
                this.findOne(bookingId, ["items"])
                    .then(booking => {
                        Logger.info(`REMINDER - Booking ID: ${booking.id}; Payment Status: ${booking.paymentStatus}; Deposit Status: ${booking.depositStatus}`);
                        if (booking != null && booking.id !== "") {
                            if (booking.bookingStatus === BOOKING_STATUS.AWAITING_PAYMENT) {
                                // Notify to user about the payment.
                                PushNotificationService.sendBookingReminder(booking, NOTIFY_BOOKING_REMINDER.DAILY_REMINDER);

                                // Daily payment reminder
                                this.triggerPaymentReminder(booking, urlCallback);
                            } else if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
                                switch (notifyType) {
                                    case NOTIFY_BOOKING_REMINDER.DAILY_REMINDER:
                                        this.triggerReminder24hBefore(booking, urlCallback);
                                        break;

                                    case NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE:
                                        PushNotificationService.sendBookingReminder(booking, NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE);

                                        this.triggerReminder1hBefore(booking, urlCallback);
                                        break;

                                    case NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE:
                                        PushNotificationService.sendBookingReminder(booking, NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE);
                                        break;

                                    case NOTIFY_BOOKING_REMINDER.COUNTER_DEPOSIT:
                                        this.updateCounterDeposit(booking)
                                            .catch(err => Logger.error(err.message, err));
                                        break;
                                }
                            }
                        }
                    })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
            });
    }

    /**
     * Trigger notify payment reminder.
     *
     * @param booking
     * @param urlCallback
     * @description: Please do not remove the console log information.
     */
    private triggerPaymentReminder(booking: BookingModel, urlCallback: string) {
        let current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_DEFAULT).startOf("date");
        let triggerTime: momentTz.Moment = current.add(1, "d").add(NOTIFY_BOOKING_REMINDER.DAILY_REMINDER, "h");
        let notifyType: number = NOTIFY_BOOKING_REMINDER.DAILY_REMINDER;

        // TESTING
        if (Scheduler.isDebug()) {
            current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_VN);
            triggerTime = current.add(NOTIFY_BOOKING_REMINDER.REMINDER_DEBUGGING_SECONDS, "s");
        }
        // END TESTING

        Logger.info("Trigger payment reminder - debugging: " + Scheduler.isDebug());
        Logger.info("Trigger time: " + triggerTime.toDate());

        this.createScheduleNotify(booking.id, notifyType, triggerTime.toDate(), urlCallback);
    }

    /**
     * Trigger event 24h before notify.
     *
     * @param booking
     * @param urlCallback
     * @description: Please do not remove the console log information.
     */
    private triggerReminder24hBefore(booking: BookingModel, urlCallback: string) {
        let current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_DEFAULT);
        // Trigger time 24h before.
        let triggerTime: momentTz.Moment = momentTz.tz(booking.eventStartDate, TIME_ZONE.TIME_ZONE_DEFAULT);
        let difTime = triggerTime.diff(current, "h", true);
        let isMakeScheduler: boolean = true;
        let notifyType: number = NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE;

        // TESTING
        if (Scheduler.isDebug()) {
            current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_VN);
            triggerTime = current.add(NOTIFY_BOOKING_REMINDER.REMINDER_DEBUGGING_SECONDS, "s");
            // difTime = triggerTime.diff(current, "s", false);
        } else {    // END TESTING
            // Notify event start 24h before.
            if (difTime < NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE) {
                // Only start trigger notify event 1h before.
                notifyType = NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE;

                // Notify event start 1h before.
                if (difTime < NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE) {
                    // PushNotificationService.sendBookingReminder(booking, NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE);

                    isMakeScheduler = false;
                } else {
                    triggerTime = triggerTime.add(-NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE, "h");
                }
            } else {
                triggerTime = triggerTime.add(-NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE, "h");
            }
        }

        if (isMakeScheduler) {
            Logger.info("Trigger reminder 24h before - debugging: " + Scheduler.isDebug());
            Logger.info("Event start date: " + booking.eventStartDate.toDate());
            Logger.info("Trigger time: " + triggerTime.toDate());

            this.createScheduleNotify(booking.id, notifyType, triggerTime.toDate(), urlCallback);
        }
    }

    /**
     * Trigger event 1h before notify.
     *
     * @param booking
     * @param urlCallback
     * @description: Please do not remove the console log information.
     */
    private triggerReminder1hBefore(booking: BookingModel, urlCallback: string) {
        let notifyType: number = NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE;
        let eventStart: momentTz.Moment = momentTz.tz(booking.eventStartDate, TIME_ZONE.TIME_ZONE_DEFAULT);
        // Only start trigger notify event 1h before.
        let triggerTime: momentTz.Moment = eventStart.add(-NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE, "h");

        // TESTING
        if (Scheduler.isDebug()) {
            let current = momentTz.tz(new Date(), TIME_ZONE.TIME_ZONE_VN);
            triggerTime = current.add(NOTIFY_BOOKING_REMINDER.REMINDER_DEBUGGING_SECONDS, "s");
        }
        /// END TESTING

        Logger.info("Trigger reminder 1h before - debugging: " + Scheduler.isDebug());
        Logger.info("Event start date: " + eventStart.toDate());
        Logger.info("Trigger time: " + triggerTime.toDate());

        this.createScheduleNotify(booking.id, notifyType, triggerTime.toDate(), urlCallback);
    }
    /**
     * Trigger counter deposit.
     *
     * @param booking
     * @param urlCallback
     */
    private triggerCounterDeposit(booking: BookingModel, urlCallback: string) {
        let notifyType: string = NOTIFY_BOOKING_REMINDER.COUNTER_DEPOSIT;
        let triggerTime: momentTz.Moment = momentTz.tz(booking.eventEndDate, TIME_ZONE.TIME_ZONE_DEFAULT);

        Logger.info("Trigger counter deposit");
        Logger.info("Trigger time: " + triggerTime.toDate());

        this.createScheduleNotify(booking.id, notifyType, triggerTime.toDate(), urlCallback);
    }

    /**
     * Update the counter deposit.
     *
     * @param booking
     */
    private updateCounterDeposit(booking: BookingModel) {
        try {
            if (booking.depositStatus === DEPOSIT_STATUS.PENDING &&
                (booking.paymentStatus === PAYMENT_STATUS.NOT_APPLICABLE || booking.paymentStatus === PAYMENT_STATUS.PAID)) {
                let searchParams = {
                    id: booking.id
                };
                let updateBookingStatus = new BookingModel();
                updateBookingStatus.depositStatus = DEPOSIT_STATUS.DUE;
                Logger.info(`Update booking ${booking.id} depositStatus to Due`);
                return Promise.resolve()
                    .then(() => {
                        return this.update(searchParams, updateBookingStatus);
                    })
                    .tap(() => {
                        Logger.info(`Update booking ${booking.id} counter deposit on firebase`);
                        this.updateCounterDepositOnFirebase(booking.condoId)
                            .catch(err => Logger.error(err.message, err));
                    })
                    .catch(err => Logger.error(err.message, err));

            }
        } catch (err) {
            Logger.error(err.message, err);
        }
    }

    /**
     * Update the counter deposit
     *
     * @param condoId
     * @param isIncrease
     * @param numberOfItems
     * @returns {Bluebird<U>}
     */
    public updateCounterDepositOnFirebase(condoId: string, isIncrease: boolean = true): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
            .then(() => {
                if (isIncrease) {
                    return Redis.getClient().incrAsync(Redis.getCounterDepositKey(condoId));
                }
                return Redis.getClient().decrAsync(Redis.getCounterDepositKey(condoId));
            })
            .then(result => {
                return fb.database().ref("counter").child(`${condoId}`)
                    .update({
                        returnDeposit: result
                    })
                    .catch(err => Logger.error(err.message, err));
            }).catch(err => Logger.error(err.message, err));
    }

    /**
     * Update the counter deposit
     *
     * @param condoId
     * @param counter
     * @returns {Bluebird<U>}
     */
    public setCounterDeposit(condoId: string, counter: number): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
            .then(() => {
                return Redis.getClient().setAsync(Redis.getCounterDepositKey(condoId), counter);
            })
            .then(result => {
                return fb.database().ref("counter").child(`${condoId}`)
                    .update({
                        returnDeposit: counter
                    })
                    .catch(err => Logger.error(err.message, err));
            }).catch(err => Logger.error(err.message, err));
    }

    /**
     * Update the counter deposit
     *
     * @param condoId
     * @param counter
     * @returns {Bluebird<U>}
     */
    public resetCounterDepositRedis(): Promise<any> {
        return Promise.resolve()
            .then(() => {
                return CondoRepository.findByQuery(q => {
                    q.where(CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                });
            })
            .then(condos => {
                return Promise.each(condos, condo => {
                    return Redis.getClient().delAsync(Redis.getCounterDepositKey(condo.id));
                });
            })
            .catch(err => Logger.error(err.message, err));
    }

    public resetCounterDeposit() {
        return this.resetCounterDepositRedis()
        .then(result => {
            return this.countDueDepositStatusByCondo();
        })
        .then(list => {
            Logger.info(`Count Due Deposit by Condo: ${list}`);
            return Promise.each(list, data => {
                return this.setCounterDeposit(data["condo_id"], parseInt(data["duecount"]));
            });
        });
    }

    public countDueDepositStatusByCondo() {
        return BookingRepository.countDueDepositStatusByCondo();
    }

    /**
     * Create the schedule jon notify.
     * @param bookingId
     * @param notifyType
     * @param triggerTime
     * @param urlCallback
     * @description: Please do not remove the console log information.
     */
    private createScheduleNotify(bookingId: string, notifyType: any, triggerTime: Date, urlCallback: string) {
        let triggerTimeByTimeZone = momentTz.tz(triggerTime, TIME_ZONE.TIME_ZONE_DEFAULT);

        let job = Scheduler.createUniqueJob(SCHEDULER_SCRIPT.TRIGGER_NAME, {
            url: urlCallback,
            path: NOTIFY_BOOKING_REMINDER.PAYMENT_REMINDER_PATH,
            payload: {
                id: bookingId,
                type: notifyType,
                triggerTime: triggerTimeByTimeZone.toDate()
            },
        }, UUID.v4());

        Logger.info("Schedule notify: " + triggerTimeByTimeZone.toDate() + " - type: " + notifyType);

        Scheduler.scheduleOneShot(job, triggerTimeByTimeZone.toDate());
    }

    public editBookingNote(booking: BookingModel): Promise<any> {
        return Promise.resolve()
        .then(() => {
            return BookingRepository.findOne(booking.id);
        })
        .then((dtoObject) => {
            if (dtoObject == null) {
                return Promise.reject(new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            let updateParams = {};
            updateParams[BOOKING_TABLE_SCHEMA.FIELDS.NOTE] = booking.note;
            return BookingRepository.updateByQuery(q => {
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.ID, booking.id);
            }, updateParams);
            // return BookingRepository.update(booking);
        })
        .then(() => {
            return BookingRepository.findOne(booking.id, ["items.slot", "items.slot.rule", "items.facility", "user", "unit", "condo", "block"]);
        });
    }

    public editBooking(booking: BookingModel, fromCM: boolean = false, urlCallback?: string): Promise<BookingModel> {
        let user: UserModel;
        let bookForCondo: boolean;
        return Promise.resolve()
            .then(() => {
                return UserRepository.findOneByQuery(q => {
                    q.where(Schema.USER_TABLE_SCHEMA.FIELDS.ID, booking.userId);
                })
                .then(object => {
                    user = object;
                    bookForCondo = user.roleId === ROLE.CONDO_MANAGER ? true : false;
                });
            })
            .then(() => this.validateBooking(booking, fromCM, bookForCondo))
            .then(() => BookingRepository.update(booking))
            .then(() => this.saveBookingItem(booking, true))
            .then(() => TransactionHistoryService.updateAmount(booking))
            .then(() => this.updateBookingCondition(booking, bookForCondo))
            .then(() => BookingRepository.findOne(booking.id, ["items.slot", "items.slot.rule", "items.facility", "user", "unit", "condo", "block"]))
            .then(booking => {
                // Facility Booking - Confirmed
                if (booking.paymentAmount > 0) {
                    Mailer.sendFacilityBookingConfirmed(booking, booking.receiptNo, false)
                    .catch(err => Logger.error(err.message, err));
                } else {
                    // booking free
                    Mailer.sendFacilityBookingConfirmedNoPaymentNeeded(booking)
                        .catch(err => Logger.error(err.message, err));
                }
                return booking;
            })
            .tap((booking) => {
                // Create schedule payment reminder. Daily reminder at 12PM
                try {
                    this.bookingReminder(booking.id, NOTIFY_BOOKING_REMINDER.DAILY_REMINDER, urlCallback)
                        .catch(err => Logger.error(err.message, err));

                    // Trigger counter deposit.
                    this.triggerCounterDeposit(booking, urlCallback);
                } catch (err) {
                    Logger.error(err.message, err);
                }
            })
            .catch(err => {
                throw err;
            });
    }

    public buildKey(booking: BookingModel): Promise<string> {
        let bookingKey: string = null;
        return Promise.resolve()
            .then(() => BookingRepository.findOne(booking.id, ["items.slot", "items.slot.rule", "items.facility", "user", "unit", "condo", "block"]))
            .then(old => {
                old.items.forEach(item => {
                    let rule = item.slot.rule;
                    let keyObject = this.generateKey(old, rule);
                    bookingKey = keyObject["key"];
                });
                return bookingKey;
            })
            .catch(err => Logger.error(err.message, err));
    }

    public delete(bookingId: string): Promise<any> {
        if (bookingId != null && bookingId !== "") {
            return Promise.resolve()
                .then(() => {
                    return this.checkCanDeleteBooking(bookingId);
                })
                .then(item => {
                    if (item === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    } else {
                        let updateParams = {};
                        updateParams[BOOKING_TABLE_SCHEMA.FIELDS.IS_ENABLE] = false;
                        return BookingRepository.updateByQuery(q => {
                            q.where(BOOKING_TABLE_SCHEMA.FIELDS.ID, bookingId);
                        }, updateParams);
                    }
                })
                .then(result => {
                    return result;
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    public checkCanDeleteBooking(bookingId: string): Promise<any> {
        let currentDate = new Date().toISOString();
        return Promise.resolve()
        .then(() => {
            return BookingRepository.findByQuery(q => {
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.ID, bookingId);
                q.where(q1 => {
                    q1.where(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE}`, "<", currentDate);
                    q1.orWhere(`${BOOKING_TABLE_SCHEMA.TABLE_NAME}.${BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS}`, PAYMENT_STATUS.CANCELLED);
                });
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(BOOKING_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            });
        });
    }

    public getSpecialPrice(bookingItem: BookingItemModel, specialPrices: BookingSpecialPricesModel[], timezone = TIME_ZONE.TIME_ZONE_DEFAULT): BookingSpecialPricesModel {
        let result: BookingSpecialPricesModel;
        for (let price of specialPrices) {
            if (this.isMeetPriceCondition(bookingItem, price, timezone)) {
                result = price;
                break;
            }
        }
        return result;
    }

    public isMeetPriceCondition(bookingItem: BookingItemModel, specialPrice: BookingSpecialPricesModel, timezone: string): boolean {
        let result = false;
        switch (specialPrice.type) {
            case BOOKING_SPECIAL_PRICE_TYPE.SPECIAL_DAY:
                for (let condition of specialPrice.condition) {
                    if (bookingItem.eventStartDate.tz(timezone).format(MOMENT_DATE_FORMAT.YYYY_MM_DD) === condition) {
                        result = true;
                        break;
                    }
                }
                break;

            case BOOKING_SPECIAL_PRICE_TYPE.SPECIAL_TIME:
                for (let condition of specialPrice.condition) {
                    let startTime = momentTz(condition.split("-")[0], MOMENT_DATE_FORMAT.HH_MM);
                    let endTime = momentTz(condition.split("-")[1], MOMENT_DATE_FORMAT.HH_MM);
                    let eventStartTime = momentTz(bookingItem.startTime, MOMENT_DATE_FORMAT.HH_MM);
                    let eventEndTime = momentTz(bookingItem.endTime, MOMENT_DATE_FORMAT.HH_MM);
                    if (startTime <= eventStartTime && endTime >= eventEndTime) {
                        result = true;
                        break;
                    }
                }
                break;

            case BOOKING_SPECIAL_PRICE_TYPE.TIME_TYPE:
                for (let condition of specialPrice.condition) {
                    if (bookingItem.slotTimeTypeId === condition) {
                        result = true;
                        break;
                    }
                }
                break;

            case BOOKING_SPECIAL_PRICE_TYPE.WEEK_DAY:
                for (let condition of specialPrice.condition) {
                    if (condition.indexOf(bookingItem.eventStartDate.tz(timezone).isoWeekday().toString()) !== -1) {
                        result = true;
                        break;
                    }
                }
                break;

            default:
                break;
        }
        return result;
    }
}

export default BookingService;
