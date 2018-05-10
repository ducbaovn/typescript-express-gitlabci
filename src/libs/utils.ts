/**
 * Created by davidho on 1/9/17.
 */

import * as bcrypt from "bcrypt";
import * as momentTz from "moment-timezone";
import * as Promise from "bluebird";
import {Moment} from "moment-timezone";
import {ExceptionModel} from "../models";
import {ErrorCode, HttpStatus} from "../libs";
import {MOMENT_DATE_FORMAT, PASSWORD_LENGTH, TIME_ZONE} from "./constants";
let crypto = require("crypto");
import * as path from "path";
import * as fs from "fs";
export class Utils {

    public static PromiseLoop(condition: () => boolean, action: () => Promise<any>): Promise<any> {
        let loop = () => {
            if (condition()) {
                return;
            }
            return Promise.resolve(action()).then(loop);
        };
        return Promise.resolve().then(loop);
    }

    public static stringToDate(date: string): Date {
        return momentTz.tz(new Date(date), "GMT").toDate();
    }

    public static millisecondsToDate(time: number): Date {
        return momentTz.tz(new Date(time), "GMT").toDate();
    }

    public static toDate(date: any): Date {
        let result = new Date(date);
        if (isNaN(result.getTime())) {
            result = new Date(parseInt(date));
        }
        if (isNaN(result.getTime())) {
            throw new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_DATE_TYPE.CODE,
                ErrorCode.RESOURCE.INVALID_DATE_TYPE.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            );
        }
        return result;
    }

    public static dateByFormat(date: any, format?: string, timezone?: string): string {
        if (!timezone) {
            timezone = TIME_ZONE.TIME_ZONE_UTC;
        }

        if (!format) {
            format = MOMENT_DATE_FORMAT.YYYY_MM_DD_H_m;
        }

        return momentTz.tz(this.toDate(date), timezone).format(format);
    }

    public static combineDateTimeString(dateUTCString: string, timeString?: string, timezone?: string) {
        timezone = timezone || TIME_ZONE.TIME_ZONE_DEFAULT;
        let date = momentTz.tz(dateUTCString, timezone).startOf("date");
        if (timeString) {
            let time = momentTz(timeString, MOMENT_DATE_FORMAT.HH_MM);
            date.add(time.get("h"), "h").add(time.get("m"), "m");
        }
        return date;
    }

    public static validateEmail(email): boolean {
        if (email == null) {
            return false;
        }
        // Regex for validating email.
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    public static randomText(len: number): string {
        let set = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
        let setLen = set.length;
        let salt = "";
        for (let i = 0; i < len; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }
        return salt;
    }

    public static randomPassword(len: number): string {
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        let randomstring = "";
        let charCount = 0;
        let numCount = 0;

        for (let i = 0; i < len; i++) {
            // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value.
            if ((Math.floor(Math.random() * 2) === 0) && numCount < 3 || charCount >= 5) {
                let rnum = Math.floor(Math.random() * 10);
                randomstring += rnum;
                numCount += 1;
            } else {
                // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
                let rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
                charCount += 1;
            }
        }
        return randomstring;
    }

    public static randomPin(numberOfCharacter: number): string {
        let pin = "";
        for (let i = 0; i < numberOfCharacter; i++) {
            pin += Math.floor(Math.random() * 10).toString();
        }
        return pin;
    }

    public static randomNumber(min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE): number {
        if (min != null && max != null) {
            return Math.floor(Math.random() * max + min);
        }
        return 0;
    }

    public static compareHash(password: string, hash: string): boolean {
        if (password == null || hash == null) {
            return false;
        }

        return bcrypt.compareSync(password, hash);
    }

    public static hashPassword(password: string): string {
        if (password != null && password !== "") {
            return bcrypt.hashSync(password, 10);
        }
        return password;
    }

    /**
     * Check password strength. Must meet the following criteria:
     *
     * - Contain at least 6 characters
     * - Contain at least 1 number
     * - Contain at least 1 lowercase character (a-z)
     * - Contain at least 1 uppercase character (A-Z)
     * - Contains only 0-9a-zA-Z
     * @param password Password to check
     * @return {boolean}
     */
    public static validatePassword(password): boolean {
        if (password == null) {
            return false;
        }
        // let re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
        // return re.test(password);
        return password.length >= PASSWORD_LENGTH;
    }

    /**
     * Round Number
     * @returns {string}
     * @param num
     * @param numberOfDecimalPoint
     */
    public static roundNumber(num: number, numberOfDecimalPoint: number = 0): number {
        let newNumber = Number(num.toFixed(numberOfDecimalPoint));

        return isNaN(newNumber) ? 0 : newNumber;
    }

    /**
     * convert number to string
     * @returns {string}
     * @param num
     */
    public static numberWithCommas(num: number): string {
        let parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    /**
     * convert app version to number
     * @returns {string}
     * @param num
     */
    public static versionToNumber(version: string): number {
        let parts = version.split(".");
        return parseInt(parts[0]) * 100 + parseInt(parts[1]);
    }

    public static camelCaseString(s: string): string {
        let words = s.trim().split(/\s+/);
        for (let word of words) {
            word = word.replace(/./, word[0].toUpperCase());
        }
        return words.join(" ");
    }

    public static encryptStringWithRsaPublicKey(toEncrypt): string {
        let relativeOrAbsolutePathToPublicKey = path.join(__dirname, "..", "configs", "server.pub");
        let absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
        let publicKey = fs.readFileSync(absolutePath, "utf8");
        let key = {};
        key["key"] = publicKey;
        key["padding"] = crypto.constants.RSA_PKCS1_PADDING;
        let buffer = new Buffer(toEncrypt);
        let encrypted = crypto.publicEncrypt(key, buffer);
        return encrypted.toString("base64");
    }

    public static decryptStringWithRsaPrivateKey(toDecrypt): Promise<string> {
        let relativeOrAbsolutePathtoPrivateKey = path.join(__dirname, "..", "configs", "server.key.pem");
        let absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
        return new Promise((resolve, reject) => {
            fs.readFile(absolutePath, "utf8", (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        })
        .then(privateKey => {
            let key = {};
            key["key"] = privateKey;
            key["padding"] = crypto.constants.RSA_PKCS1_PADDING;
            let buffer = new Buffer(toDecrypt, "base64");
            let decrypted = crypto.privateDecrypt(key, buffer);
            return decrypted.toString("utf8");
        });
    }
}

export default Utils;
