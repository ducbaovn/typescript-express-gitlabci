/**
 * Created by phuongho on 10/18/16.
 */
import {MESSAGE_INFO} from "../libs/constants";

export class StateModel {
    public title: string;
    public code: number;
    public value: string;
    public message: string;
    public totalSuccess: number;
    public totalFail: number;
    public failIndex: number[];

    public static init(code: number, value: string, message: string, title?: string, totalSuccess?: number, totalFail?: number, failIndex?: number[]) {
        let model = new StateModel();
        model.title = title;
        model.code = code;
        model.value = value;
        model.message = message;
        model.totalSuccess = totalSuccess;
        model.totalFail = totalFail;
        model.failIndex = failIndex;

        return model;
    }

    // State: Create new record successful
    public static createSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_CREATE_SUCCESSFUL);
    }

    // State: Update record successful
    public static updateSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_UPDATE_SUCCESSFUL);
    }

    // // State: Update record unsuccessful
    public static updateUnSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_UPDATE_UNSUCCESSFUL);
    }


    // State: Delete record successful
    public static deleteSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_DELETE_SUCCESSFUL);
    }

    // State: Delete record un successful
    public static deleteUnSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_DELETE_UNSUCCESSFUL);
    }

    // State: Import record successful
    public static importSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_IMPORT_SUCCESSFUL);
    }

    // State: Export record successful
    public static exportSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_EXPORT_SUCCESSFUL);
    }

    // State: Change password successful
    public static changePasswordSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_CHANGE_PW_SUCCESSFUL);
    }

    // State: Apply pin successful
    public static applyPinSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_APPLY_PIN_SUCCESSFUL);
    }

    // State: Reset pin successful
    public static resetPinSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_RESET_PIN_SUCCESSFUL);
    }

    // State: Reset pin successful
    public static resetPasswordSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_RESET_PASSWORD_SUCCESSFUL);
    }

    // State: Update record successful
    public static uploadSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_UPLOAD_SUCCESSFUL);
    }

    public static bulkCreate(totalSuccess: number, totalFail: number, failIndex?: number[]) {
        let title = MESSAGE_INFO.MI_IMPORT_SUCCESSFUL;
        let message = MESSAGE_INFO.MI_BULK(totalSuccess, totalFail, failIndex);
        return this.stateSuccessful(null, message, title, totalSuccess, totalFail, failIndex);
    }

    // State: like successful
    public static likeSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_LIKE_SUCCESSFUL);
    }

    // State: like successful
    public static unLikeSuccessful(value?: string) {
        return this.stateSuccessful(value, MESSAGE_INFO.MI_UNLIKE_SUCCESSFUL);
    }

    // State: Action successful
    public static stateSuccessful(value: string, message: string, title?: string, totalSuccess?: number, totalFail?: number, failIndex?: number[]) {
        title = title ? title : MESSAGE_INFO.MI_TITLE_MESSAGE;
        return this.init(undefined, value, message, title, totalSuccess, totalFail, failIndex);
    }

    // State: Error
    public static stateError(code: number, message: string, title?: string) {
        title = title ? title : MESSAGE_INFO.MI_TITLE_MESSAGE;
        return this.init(code, undefined, message, title);
    }
}

export default StateModel;
