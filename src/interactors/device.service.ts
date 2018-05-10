
import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {DeviceModel, PushMessageModel, NotificationModel} from "../models";
import {DeviceRepository, NotificationRepository} from "../data";
import * as Schema from "../data/sql/schema";
import {Logger, FirebaseAdmin} from "../libs";
import {PushNotificationService} from "./";
import {DEVICE_OS, USER_SETTING_PUSH_TYPE, PUSH_NOTIFICATION_TYPE} from "../libs/constants";
/**
 * Created by davidho on 1/9/17.
 */

export class DeviceService extends BaseService<DeviceModel, typeof DeviceRepository> {
    constructor() {
        super(DeviceRepository);
    }

    /**
     *
     * @param model
     * @param related
     * @param filters
     * @returns {any}
     */
    public create(model: DeviceModel, related = [], filters = []): Promise<DeviceModel> {
        if (model != null) {
            return DeviceRepository.findByDeviceId(model.deviceId)
                .then(device => {
                    if (device != null) {
                        model.id = device.id;
                        return DeviceRepository.update(model);
                    } else {
                        return DeviceRepository.insert(model);
                    }
                })
                .then((object) => {
                    return DeviceRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    /**
     *
     * @param userId
     * @param deviceId
     * @param ignoreDevices
     * @returns {any}
     */
    public deleteByUserId(userId: string, deviceId?: string, ignoreDevices?: string[]): Promise<any> {
        if (userId != null) {
            return DeviceRepository.deleteByQuery(q => {
                q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
                if (deviceId != null) {
                    q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_ID, deviceId);
                }
                if (ignoreDevices != null && ignoreDevices.length > 0) {
                    q.whereNotIn(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_ID, ignoreDevices);
                }
            });
        }
        return Promise.resolve(null);
    }

    /**
     * Get devices by user id.
     * @returns {Promise<any>}
     * @param userId
     */
    public getDeviceByUserId(userId: string): Promise<DeviceModel> {
        return DeviceRepository.findOneByQuery(q => {
            q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, ["user.setting"]);
    }

    public getDevicesByUserId(userId: string): Promise<DeviceModel[]> {
        if (userId == null || userId === "") {
            return Promise.resolve([]);
        }
        return DeviceRepository.findByQuery(q => {
            q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, ["user.setting"]);
    }

    /**
     * Push notification to user
     *
     * @param userIds
     * @param message
     * @param type
     * @returns {Bluebird<boolean>}
     */
    public pushToUsers(userIds: string[] = [], message: PushMessageModel, type?: string): Promise<boolean> {
        if (userIds.length === 0) {
            Logger.info("Users are empty, nothing to push");
        }

        return Promise.resolve()
            .then(() => {
                return Promise.each(userIds, (userId) => {
                    message.data.userId = userId;
                    let notification = NotificationModel.fromPushMessage(message);
                    let dataUpdate = {};
                    if (notification.groupType === PUSH_NOTIFICATION_TYPE.MY_CONDO) {
                        dataUpdate["isMyCondoNew"] = true;
                    } else if (notification.groupType === PUSH_NOTIFICATION_TYPE.SOCIAL) {
                        dataUpdate["isSocialNew"] = true;
                    }
                    return Promise.all([NotificationRepository.insert(notification), PushNotificationService.updateCounterPush(userId, dataUpdate)])
                    .then(() => {
                        return this.getDevicesByUserId(userId)
                        .then(devices => {
                            if (devices != null && devices.length > 0) {
                                let allowPush: boolean = true;

                                if (devices[0].user && devices[0].user.setting) {
                                    let userSetting = devices[0].user.setting;

                                    switch (type) {
                                        case USER_SETTING_PUSH_TYPE.CHAT:
                                            allowPush = userSetting.isReceiverPushChat;
                                            break;

                                        case USER_SETTING_PUSH_TYPE.GARAGE_SALE:
                                            allowPush = userSetting.isReceiverPushGarageSale;
                                            break;

                                        case USER_SETTING_PUSH_TYPE.FIND_A_BUDDY:
                                            allowPush = userSetting.isReceiverPushFindABuddy;
                                            break;

                                        case USER_SETTING_PUSH_TYPE.CHATTERBOX:
                                            allowPush = userSetting.isReceiverPushChatterbox;
                                            break;

                                        case USER_SETTING_PUSH_TYPE.LOVE:
                                            allowPush = userSetting.isReceiverPushLove;
                                            break;

                                        default:
                                            allowPush = true;
                                    }
                                }

                                if (allowPush) {
                                    return this.pushToDevices(devices, message)
                                        .catch(err => {
                                            Logger.error(err.message, err);
                                        });
                                }
                            }
                        })
                        .catch(err => {
                            Logger.error(err.message, err);
                            return true;
                        });
                    })
                    .catch(err => {
                        Logger.error(err.message, err);
                    });
                });
            })
            .then(() => {
                return true;
            });
    }

    /**
     * Push notification to device
     *
     * @param devices
     * @param message
     * @returns {Bluebird<boolean>}
     */
    public pushToDevices(devices: DeviceModel[] = [], message: PushMessageModel): Promise<boolean> {
        if (devices.length === 0) {
            Logger.info("Device list is empty, nothing to push");
            return Promise.resolve(true);
        }

        return Promise.resolve()
            .then(() => {
                message.iOSDevices = [];
                message.androidDevices = [];

                return Promise.each(devices, (device) => {
                    if (device instanceof DeviceModel) {
                        let dev = device as DeviceModel;

                        if (dev.registrarId != null && dev.registrarId !== "") {
                            if (dev.deviceOs.toLowerCase() === DEVICE_OS.iOS.toLowerCase()) {
                                message.iOSDevices.push(dev.registrarId);
                            } else if (dev.deviceOs.toLowerCase() === DEVICE_OS.ANDROID.toLowerCase()) {
                                message.androidDevices.push(dev.registrarId);
                            }
                        }
                    }
                });
            })
            .then(() => {
                return PushNotificationService.push(message);
            })
            .catch(err => {
                Logger.error(err.message, err);
                return false;
            });
    }
}

export default DeviceService;
