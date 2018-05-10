/**
 * Created by davidho on 4/13/17.
 */

import * as Promise from "bluebird";
import * as firebase from "firebase-admin";
import {BaseService} from "./base.service";
import {UserSettingModel} from "../models";
import {UserSettingRepository} from "../data";
import {FirebaseAdmin, Logger} from "../libs/index";

export class UserSettingService extends BaseService<UserSettingModel, typeof UserSettingRepository> {
    constructor() {
        super(UserSettingRepository);
    }

    /**
     *
     * @param userId
     * @param related
     * @param filters
     * @returns {any}
     */
    public findByUserId(userId: string, related = [], filters = []): Promise<UserSettingModel> {
        if (userId != null) {
            return UserSettingRepository.findByUserId(userId, related, filters)
                .then(object => {
                    if (object === null) {
                        let setting = UserSettingModel.defaultSetting();
                        setting.userId = userId;
                        return UserSettingRepository.insertGet(setting);
                    }
                    return object;
                });
        }

        return Promise.resolve(null);
    }

    /**
     *
     * @param setting
     * @param related
     * @param filters
     * @returns {any}
     */
    public createOrUpdate(setting: UserSettingModel, related = [], filters = []): Promise<UserSettingModel> {
        if (setting != null) {
            return UserSettingRepository.findByUserId(setting.userId)
                .then(object => {
                    if (object !== null) {
                        setting.id = object.id;
                        return UserSettingRepository.update(setting);
                    }
                    return UserSettingRepository.insert(setting);
                })
                .then(object => {
                    return UserSettingRepository.findById(object.id, related, filters);
                })
                .tap((settings) => {
                    // Update settings notification on firebase. On-Off
                    let sdk = FirebaseAdmin.getInstance();

                    if (sdk != null) {
                        sdk.database()
                            .ref("/users")
                            .child(setting.userId)
                            .update({
                                isReceivePushChat: settings.isReceiverPushChat,
                                updatedDate: firebase.database.ServerValue.TIMESTAMP
                            })
                            .catch(err => Logger.error(err.message, err));
                    }
                });
        }

        return Promise.resolve(null);
    }
}

export default UserSettingService;
