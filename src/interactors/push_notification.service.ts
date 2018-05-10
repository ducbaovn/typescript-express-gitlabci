/**
 * Created by kiettv on 12/9/16.
 */
import * as stringFormat from "string-format";
import * as Promise from "bluebird";
import {DeviceService} from "./index";
import {FCMNotify, Logger, Utils, FirebaseAdmin} from "../libs";
import {
    FEED_TYPE,
    MOMENT_DATE_FORMAT,
    NOTIFY_BOOKING_REMINDER,
    PUSH_NOTIFICATION_TYPE,
    TIME_ZONE,
    USER_SETTING_PUSH_TYPE,
    FEEDBACK_STATUS
} from "../libs/constants";
import {
    AnnouncementModel,
    FeedCommentModel,
    FeedModel,
    GarageSaleModel,
    PushMessageModel,
    WhatOnModel,
    UserModel,
    BookingItemModel,
    BookingModel,
    NotificationModel,
    CollectionWrap,
    FeedbackModel
} from "../models";
import { NotificationDto } from "../data/sql/models";
import { NotificationRepository } from "../data";

export class PushNotificationService {

    /**
     *
     * @param message
     * @returns {Promise<void>}
     */
    public push(message: PushMessageModel): Promise<boolean> {
        return Promise.resolve()
            .then(() => {
                if (message.iOSDevices != null && message.iOSDevices.length > 0) {
                    FCMNotify.pushToiOS(message)
                        .catch(err => {
                            Logger.error(err.message, err);
                        });
                }

                if (message.androidDevices != null && message.androidDevices.length > 0) {
                    FCMNotify.pushToAndroid(message)
                        .catch(err => {
                            Logger.error(err.message, err);
                        });
                }

                return true;
            })
            .catch((err) => {
                Logger.error(err.message, err);
                return false;
            });
    }

    /**
     * Condo manager Approve
     * push welcome message
     * @param userId
     */
    public sendWelcomeCondo(userId: string): boolean {
        if (userId) {
            let message = new PushMessageModel();

            message.title = PUSH_NOTIFICATION_TYPE.WELCOME_CONDO.TITLE;
            message.body = PUSH_NOTIFICATION_TYPE.WELCOME_CONDO.MESSAGE;
            message.clickAction = PUSH_NOTIFICATION_TYPE.WELCOME_CONDO.CLICK_ACTION;
            message.data.type = PUSH_NOTIFICATION_TYPE.WELCOME_CONDO.TYPE;

            DeviceService.pushToUsers([userId], message)
                .catch(err => {
                    Logger.error(err.message, err);
                });
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * When Super Admin Update Latest Transaction Data
     *
     * @param userIds
     * @param condoName
     * @param salePrice
     * @param rentPrice
     * @returns {boolean}
     */
    public sendLatestTransaction(userIds: string[], condoName: string, salePrice: string, rentPrice: string): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();

            message.title = stringFormat(PUSH_NOTIFICATION_TYPE.LATEST_TRANSACTION.TITLE, condoName);
            message.body = stringFormat(PUSH_NOTIFICATION_TYPE.LATEST_TRANSACTION.MESSAGE, salePrice, rentPrice);
            message.clickAction = PUSH_NOTIFICATION_TYPE.LATEST_TRANSACTION.CLICK_ACTION;
            message.data.type = PUSH_NOTIFICATION_TYPE.LATEST_TRANSACTION.TYPE;

            DeviceService.pushToUsers(userIds, message)
                .catch(err => {
                    Logger.error(err.message, err);
                });
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * Condo Manager or Super Admin Post new event
     * send push when new what on post
     * @param userIds
     * @param whaton
     * @returns {boolean}
     */
    public sendPostWhatOn(userIds: string[], whaton: WhatOnModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();

            message.title = PUSH_NOTIFICATION_TYPE.WHAT_ON_NEW_POST.TITLE;
            message.body = whaton.titleListView;
            message.clickAction = PUSH_NOTIFICATION_TYPE.WHAT_ON_NEW_POST.CLICK_ACTION;
            message.data.type = PUSH_NOTIFICATION_TYPE.WHAT_ON_NEW_POST.TYPE;
            message.data.itemId = whaton.id;

            DeviceService.pushToUsers(userIds, message)
                .catch(err => {
                    Logger.error(err.message, err);
                });
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * Condo Manager or Super Admin Post announcements
     * send push when new announcement post
     * @param userIds
     * @param announcement
     * @returns {boolean}
     */
    public sendPostAnnouncement(userIds: string[], announcement: AnnouncementModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();

            message.title = PUSH_NOTIFICATION_TYPE.ANNOUNCEMENT_NEW_POST.TITLE;
            message.body = announcement.titleListView;
            message.clickAction = PUSH_NOTIFICATION_TYPE.ANNOUNCEMENT_NEW_POST.CLICK_ACTION;
            message.data.type = PUSH_NOTIFICATION_TYPE.ANNOUNCEMENT_NEW_POST.TYPE;
            message.data.itemId = announcement.id;

            DeviceService.pushToUsers(userIds, message)
                .catch(err => {
                    Logger.error(err.message, err);
                });
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * OTHER users Post new garage sale for Sale or for Rent
     * OTHER users Post new find a buddy listing
     * send push when new feed post
     * @param userIds
     * @param type
     * @param feed
     * @returns {boolean}
     */
    public sendPostFeed(userIds: string[], type: string, feed: FeedModel | GarageSaleModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();
            let title: string;
            let body: string;
            let clickAction: string;
            let pushType: number;
            let userSettingPushType: string;

            switch (type) {
                case FEED_TYPE.GARAGE_SALE:
                    title = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_NEW_POST.TITLE;
                    body = stringFormat(PUSH_NOTIFICATION_TYPE.GARAGE_SALE_NEW_POST.MESSAGE, feed.user.firstName, feed.title, feed.type);
                    clickAction = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_NEW_POST.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_NEW_POST.TYPE;
                    userSettingPushType = USER_SETTING_PUSH_TYPE.GARAGE_SALE;
                    break;

                case FEED_TYPE.FIND_A_BUDDY:
                    title = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_NEW_POST.TITLE;
                    body = stringFormat(PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_NEW_POST.MESSAGE, feed.user.firstName, feed.title);
                    clickAction = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_NEW_POST.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_NEW_POST.TYPE;
                    userSettingPushType = USER_SETTING_PUSH_TYPE.FIND_A_BUDDY;
                    break;
            }

            if (title && body && type) {
                message.title = title;
                message.body = body;
                message.clickAction = clickAction;
                message.data.type = pushType;
                message.data.itemId = feed.id;

                DeviceService.pushToUsers(userIds, message, userSettingPushType)
                    .catch(err => Logger.error(err.message, err));
            }
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * When some one LOVES your item/posting, you get notification
     * send push when user like feed
     * @param userIds
     * @param feedType
     * @param feed
     * @param userLike
     * @returns {boolean}
     */
    public sendLikeFeed(userIds: string[], feedType: string, feed: FeedModel
                            | GarageSaleModel, userLike: UserModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();

            let title: string;
            let body: string;
            let clickAction: string;
            let pushType: number;
            let userSettingPushType: string;

            userSettingPushType = USER_SETTING_PUSH_TYPE.LOVE;
            switch (feedType) {
                case FEED_TYPE.GARAGE_SALE:
                    title = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_LIKE.TITLE;
                    body = stringFormat(PUSH_NOTIFICATION_TYPE.GARAGE_SALE_LIKE.MESSAGE, userLike.firstName, feed.title);
                    pushType = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_LIKE.TYPE;
                    clickAction = PUSH_NOTIFICATION_TYPE.GARAGE_SALE_LIKE.CLICK_ACTION;
                    break;

                case FEED_TYPE.CHATTER_BOX:
                    title = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE.TITLE;
                    body = stringFormat(PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE.MESSAGE, userLike.firstName);
                    clickAction = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE.TYPE;
                    break;

                case FEED_TYPE.FIND_A_BUDDY:
                    title = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_LIKE.TITLE;
                    body = stringFormat(PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_LIKE.MESSAGE, userLike.firstName, feed.title);
                    clickAction = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_LIKE.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.FIND_A_BUDDY_LIKE.TYPE;
                    break;
            }

            if (title && body && pushType) {
                message.title = title;
                message.body = body;
                message.clickAction = clickAction;
                message.data.type = pushType;
                message.data.itemId = feed.id;

                DeviceService.pushToUsers(userIds, message, userSettingPushType)
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
            }
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * OTHER users COMMENT on the Topic that you CREATED
     * send push when user comment feed
     * @param userIds
     * @param feed
     * @param userComment
     * @returns {boolean}
     */
    public sendCommentFeed(userIds: string[], feed: FeedModel, userComment: UserModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();
            let title: string;
            let clickAction: string;
            let body: string;
            let pushType: number;
            let userSettingPushType: string;

            switch (feed.type) {
                case FEED_TYPE.CHATTER_BOX:
                    title = PUSH_NOTIFICATION_TYPE.CHATTERBOX_USER_COMMENT_ON_YOUR_POST.TITLE;
                    body = PUSH_NOTIFICATION_TYPE.CHATTERBOX_USER_COMMENT_ON_YOUR_POST.MESSAGE;
                    clickAction = PUSH_NOTIFICATION_TYPE.CHATTERBOX_USER_COMMENT_ON_YOUR_POST.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.CHATTERBOX_USER_COMMENT_ON_YOUR_POST.TYPE;
                    userSettingPushType = USER_SETTING_PUSH_TYPE.CHATTERBOX;
                    break;
            }

            if (title && body && pushType) {
                message.title = title;
                message.body = stringFormat(body, userComment.firstName);
                message.clickAction = clickAction;
                message.data.type = pushType;
                message.data.itemId = feed.id;

                DeviceService.pushToUsers(userIds, message, userSettingPushType)
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
            }
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * OTHER users COMMENT on the Topic you PARTICIPATED (not created)
     * @param userIds
     * @param feed
     * @param userComment
     * @returns {boolean}
     */
    public sendOtherUserCommentOnYourCommentFeed(userIds: string[], feed: FeedModel, userComment: UserModel): boolean {
        if (userIds && userIds.length > 0) {
            let message = new PushMessageModel();
            let title: string;
            let body: string;
            let clickAction: string;
            let pushType: number;
            let userSettingPushType: string;

            switch (feed.type) {
                case FEED_TYPE.CHATTER_BOX:
                    title = PUSH_NOTIFICATION_TYPE.CHATTERBOX_OTHER_USER_COMMENT.TITLE;
                    body = PUSH_NOTIFICATION_TYPE.CHATTERBOX_OTHER_USER_COMMENT.MESSAGE;
                    clickAction = PUSH_NOTIFICATION_TYPE.CHATTERBOX_OTHER_USER_COMMENT.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.CHATTERBOX_OTHER_USER_COMMENT.TYPE;
                    userSettingPushType = USER_SETTING_PUSH_TYPE.CHATTERBOX;
                    break;
            }

            if (title && body && pushType) {
                message.title = title;
                message.body = stringFormat(body, userComment.firstName);
                message.clickAction = clickAction;
                message.data.type = pushType;
                message.data.itemId = feed.id;

                DeviceService.pushToUsers(userIds, message, userSettingPushType)
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
            }
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * When someone LOVES your COMMENTS, you get notification
     * @param userId
     * @param comment
     * @param userLike
     * @returns {boolean}
     */
    public sendLikeCommentFeed(userId: string, comment: FeedCommentModel, userLike: UserModel): boolean {
        if (userId) {
            let message = new PushMessageModel();
            let title: string;
            let body: string;
            let clickAction: string;
            let pushType: number;
            let userSettingPushType: string;

            switch (comment.type) {
                case FEED_TYPE.CHATTER_BOX:
                    title = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE_COMMENT.TITLE;
                    body = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE_COMMENT.MESSAGE;
                    clickAction = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE_COMMENT.CLICK_ACTION;
                    pushType = PUSH_NOTIFICATION_TYPE.CHATTERBOX_LIKE_COMMENT.TYPE;
                    userSettingPushType = USER_SETTING_PUSH_TYPE.CHATTERBOX;
                    break;
            }

            if (title && body && pushType) {
                message.title = title;
                message.body = stringFormat(body, userLike.firstName);
                message.clickAction = clickAction;
                message.data.type = pushType;
                message.data.itemId = comment.feedId;

                DeviceService.pushToUsers([userId], message, userSettingPushType)
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
            }
            return true;
        } else {
            Logger.error("Missing user id");
            return false;
        }
    }

    /**
     * send new chat message comming
     * @param userIds
     * @param data
     */
    public sendNewChatMessage(data: any) {
        let message = new PushMessageModel();

        message.body = data.message;

        DeviceService.pushToUsers([data.userId], message)
            .catch(err => {
                Logger.error(err.message, err);
            });
    }

    /**
     * Send notification to user about the booking status: Payment reminder, event reminder (24h or 1h before)
     * @param booking
     * @param notifyType
     * @returns {boolean}
     */
    public sendBookingReminder(booking: BookingModel, notifyType: number): boolean {
        try {
            let message = new PushMessageModel();
            // Only get the first item inside the booking. Maybe improve in the future.
            let bookingItem: BookingItemModel = booking.items != null && booking.items.length > 0 ? booking.items[0] : new BookingItemModel();
            let startTime: string = Utils.dateByFormat(bookingItem.eventStartDate, MOMENT_DATE_FORMAT.HH_MM_A, TIME_ZONE.TIME_ZONE_DEFAULT);
            let endTime: string = Utils.dateByFormat(bookingItem.eventEndDate, MOMENT_DATE_FORMAT.HH_MM_A, TIME_ZONE.TIME_ZONE_DEFAULT);

            switch (notifyType) {
                case NOTIFY_BOOKING_REMINDER.DAILY_REMINDER:
                    message.title = PUSH_NOTIFICATION_TYPE.PAYMENT_REMINDER.TITLE;
                    message.body = stringFormat(PUSH_NOTIFICATION_TYPE.PAYMENT_REMINDER.MESSAGE, bookingItem.facilityName);
                    message.clickAction = PUSH_NOTIFICATION_TYPE.PAYMENT_REMINDER.CLICK_ACTION;
                    message.data.type = PUSH_NOTIFICATION_TYPE.PAYMENT_REMINDER.TYPE;
                    break;

                case NOTIFY_BOOKING_REMINDER.EVENT_24H_BEFORE:
                    message.title = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_24_HOURS_BEFORE_BOOKING_EVENT.TITLE;
                    message.body = stringFormat(PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_24_HOURS_BEFORE_BOOKING_EVENT.MESSAGE, bookingItem.facilityName, bookingItem.slotName, startTime, endTime);
                    message.clickAction = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_24_HOURS_BEFORE_BOOKING_EVENT.CLICK_ACTION;
                    message.data.type = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_24_HOURS_BEFORE_BOOKING_EVENT.TYPE;
                    break;

                case NOTIFY_BOOKING_REMINDER.EVENT_1H_BEFORE:
                    message.title = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_1_HOUR_BEFORE_BOOKING_EVENT.TITLE;
                    message.body = stringFormat(PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_1_HOUR_BEFORE_BOOKING_EVENT.MESSAGE, bookingItem.facilityName, bookingItem.slotName);
                    message.clickAction = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_1_HOUR_BEFORE_BOOKING_EVENT.CLICK_ACTION;
                    message.data.type = PUSH_NOTIFICATION_TYPE.EVENT_REMINDER_1_HOUR_BEFORE_BOOKING_EVENT.TYPE;
                    break;
            }

            message.data.itemId = booking.id;

            DeviceService.pushToUsers([booking.userId], message)
                .catch(err => {
                    Logger.error(err.message, err);
                });

            return true;
        } catch (err) {
            Logger.error(err.message, err);
            return false;
        }
    }

    public updateFeedbackStatus(feedback: FeedbackModel): boolean {
        let message = new PushMessageModel();

        switch (feedback.status) {
            case FEEDBACK_STATUS.RESOLVED:
                message.title = PUSH_NOTIFICATION_TYPE.FEEDBACK_RESOLVED.TITLE;
                message.body = feedback.title;
                message.clickAction = PUSH_NOTIFICATION_TYPE.FEEDBACK_RESOLVED.CLICK_ACTION;
                message.data.type = PUSH_NOTIFICATION_TYPE.FEEDBACK_RESOLVED.TYPE;
                break;

            case FEEDBACK_STATUS.PENDING:
                message.title = PUSH_NOTIFICATION_TYPE.FEEDBACK_REOPEN.TITLE;
                message.body = feedback.title;
                message.clickAction = PUSH_NOTIFICATION_TYPE.FEEDBACK_REOPEN.CLICK_ACTION;
                message.data.type = PUSH_NOTIFICATION_TYPE.FEEDBACK_REOPEN.TYPE;
                break;
        }

        message.data.itemId = feedback.id;

        DeviceService.pushToUsers([feedback.userId], message)
            .catch(err => {
                Logger.error(err.message, err);
            });

        return true;
    }

    public newFeedbackReply(feedback: FeedbackModel): boolean {
        let message = new PushMessageModel();

        message.title = PUSH_NOTIFICATION_TYPE.NEW_FEEDBACK_REPLY.TITLE;
        message.body = feedback.title;
        message.clickAction = PUSH_NOTIFICATION_TYPE.NEW_FEEDBACK_REPLY.CLICK_ACTION;
        message.data.type = PUSH_NOTIFICATION_TYPE.NEW_FEEDBACK_REPLY.TYPE;

        message.data.itemId = feedback.id;
        DeviceService.pushToUsers([feedback.userId], message)
            .catch(err => {
                Logger.error(err.message, err);
            });

        return true;
    }

    public updateCounterPush(userId: string, params: any): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
            .then(() => {
                let data = {
                    isPushNew: true
                };
                if (params.isMyCondoNew != null) {
                    data["isMyCondoNew"] = params.isMyCondoNew;
                }
                if (params.isSocialNew != null) {
                    data["isSocialNew"] = params.isSocialNew;
                }
                if (params.isChatNew != null) {
                    data["isChatNew"] = params.isChatNew;
                }

                return fb.database().ref("notification").child(`${userId}`)
                    .update(data)
                    .catch(err => Logger.error(err.message, err));
            })
            .catch(err => Logger.error(err.message, err));
    }

    public listMessage(params: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<NotificationModel>> {
        return NotificationRepository.search(params, offset, limit, related, filters);
    }

    public readMessage(id: string): Promise<NotificationDto> {
        let notification = new NotificationModel();
        notification.id = id;
        notification.isRead = true;
        return NotificationRepository.update(notification);
    }

    public deleteMessage(id: string): Promise<boolean> {
        return NotificationRepository.forceDelete(id);
    }
}

export default PushNotificationService;
