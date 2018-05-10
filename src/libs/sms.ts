import { MESSAGE_INFO } from "./constants";
import { ErrorCode, HttpStatus, Logger } from "./index";
import { SMSOption } from "./config";
import * as Promise from "bluebird";
import { ExceptionModel } from "../models";
/**
 * Created by davidho on 1/10/17.
 */

export class SMS {
    private opts: SMSOption;

    constructor(_opts: SMSOption) {
        this.opts = _opts;

        // if (this.opts.sandbox) {
        //     this.opts.accountSid = "AC032e7fceed189801e3d1b568d2c2c71b";
        //     this.opts.authToken = "85d96e3c845aab18c14d4a0238e3c7d1";
        //     this.opts.sender = "+15618295230";
        // } else {
        //     this.opts.accountSid = "AC032e7fceed189801e3d1b568d2c2c71b";
        //     this.opts.authToken = "85d96e3c845aab18c14d4a0238e3c7d1";
        //     this.opts.sender = "+15618295230";
        // }
    }

    /**
     *
     * @param phoneNumber
     * @param message
     * @returns {Promise<T>|Bluebird<R>|Bluebird<R|U>}
     */
    public send(area: string, phoneNumber: string, message: string): Promise<any> {
        try {
            if (area === "") {
                area = this.opts.area;
            }
            if (this.opts.sandbox === true) {
                area = this.opts.area;
            }
            return new Promise((resolve, reject) => {
                let twilio = require("twilio");
                let client = new twilio.RestClient(this.opts.accountSid, this.opts.authToken);

                client.messages.create({
                    to: area + phoneNumber,
                    from: this.opts.sender,
                    body: message,
                }, (err, message) => {
                    if (err != null) {
                        return reject(this.errorHandle(err));
                    }
                    return resolve(message.sid);
                });

            });
        } catch (error) {
            Logger.error(error.message, error);
        }
    }

    /**
     *
     * @param phoneNumber
     */

    private lookup(area: string, phoneNumber: string) {
        try {
            if (area === "") {
                area = this.opts.area;
            }
            if (this.opts.sandbox === true) {
                area = this.opts.area;
            }
            return new Promise((resolve, reject) => {
                let lookupsClient = require("twilio").LookupsClient;
                let client = new lookupsClient(this.opts.accountSid, this.opts.authToken);

                client.phoneNumbers(area + phoneNumber).get((err, phoneNumber) => {
                    if (err != null) {
                        return reject(this.errorHandle(err));
                    }
                    return resolve(phoneNumber);
                });
            });

        } catch (error) {
            Logger.error(error.message, error);
        }
    }

    /**
     *
     * @param phoneNumber
     * @returns {undefined}
     */
    public verifyPhoneNumber(area: string, phoneNumber: string) {
        return this.lookup(area, phoneNumber);
    }

    private errorHandle(err): ExceptionModel {
        switch (err.code) {
            case 21211:
            case 21614:
                return new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_PHONE_NUMBER.CODE,
                    ErrorCode.RESOURCE.INVALID_PHONE_NUMBER.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            default:
                return err;
        }
    }
}

export default SMS;
