/**
 * Created by kiettv on 12/9/16.
 */
import * as _ from "lodash";
import {PUSH_NOTIFICATION_OPTIONS} from "../libs/constants";

export class PushMessageModel {
    public iOSDevices: string[] = [];
    public androidDevices: string[] = [];

    public title: string = "";
    public icon: string = PUSH_NOTIFICATION_OPTIONS.DEFAULT_ICON;
    public body: string = "";
    public clickAction: string = "";
    public contentAvailable: boolean = false;
    public sound: string = PUSH_NOTIFICATION_OPTIONS.DEFAULT_SOUND;
    public expire: number = PUSH_NOTIFICATION_OPTIONS.DEFAULT_EXPIRE;
    public priority: string = PUSH_NOTIFICATION_OPTIONS.PRIORITY.HIGH.VALUE; // android->ios: high -> 10, normal -> 5
    public collapse: string = PUSH_NOTIFICATION_OPTIONS.DEFAULT_COLLAPSE_KEY; // ios: collapseId, android: collapseKey

    // Android specifics
    public restrictedPackageName?: string;
    public delayWhileIdle: boolean = false;
    public dryRun: boolean = true;

    // iOS specifics
    public subtitle?: string;
    public badge: number = 1;

    // Your data
    public data: any = {
        fromFCM: true,
        type: -1,
        itemId: "",
        userId: ""
    };

    public static fromRequest(obj: any): PushMessageModel {
        let message = new PushMessageModel();

        if (obj.iOSDevices != null && _.isArray(obj.iOSDevices)) {
            obj.iOSDevices.forEach((dev) => {
                if (_.isString(dev)) {
                    message.iOSDevices.push(dev);
                }
            });
        }

        if (obj.androidDevices != null && _.isArray(obj.androidDevices)) {
            obj.androidDevices.forEach((dev) => {
                if (_.isString(dev)) {
                    message.androidDevices.push(dev);
                }
            });
        }

        message.title = obj.title != null && _.isString(obj.title) ? obj.title : PUSH_NOTIFICATION_OPTIONS.DEFAULT_TITLE;
        message.icon = obj.icon != null && _.isString(obj.icon) ? obj.icon : PUSH_NOTIFICATION_OPTIONS.DEFAULT_ICON;
        message.body = obj.body != null && _.isString(obj.body) ? obj.body : PUSH_NOTIFICATION_OPTIONS.DEFAULT_MESSAGE;
        message.sound = obj.sound != null && _.isString(obj.sound) ? obj.sound : PUSH_NOTIFICATION_OPTIONS.DEFAULT_SOUND;
        message.priority = obj.priority != null && _.isString(obj.priority) ? obj.priority : PUSH_NOTIFICATION_OPTIONS.PRIORITY.HIGH.VALUE;
        message.collapse = obj.collapse != null && _.isString(obj.collapse) ? obj.collapse : PUSH_NOTIFICATION_OPTIONS.DEFAULT_SOUND;

        let expire = _.parseInt(obj.expire);
        message.expire = isNaN(expire) ? PUSH_NOTIFICATION_OPTIONS.DEFAULT_EXPIRE : expire;

        let badge = _.parseInt(obj.badge);
        message.badge = isNaN(badge) ? 1 : badge;

        if (obj.payload != null) {
            message.data = obj.data;
        }

        return message;
    }
}

export default PushMessageModel;
