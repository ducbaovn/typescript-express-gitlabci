/**
 * Created by davidho on 1/10/17.
 */

import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import {BaseService} from "./base.service";
import {CollectionWrap, PinInfoModel, ExceptionModel} from "../models";
import {ErrorCode, HttpStatus, Utils} from "../libs/index";
import {PIN_CONFIG} from "../libs/constants";
import Redis from "../data/redis/redis";

export class PinService {

    public getInfo(phoneNumber: string): Promise<PinInfoModel> {
        return Redis.getClient().getAsync(Redis.getPinKey(phoneNumber))
        .then(value => {
            return value ? JSON.parse(value) : null;
        });
    }

    public saveInfo(phoneNumber: string, info: PinInfoModel): Promise<PinInfoModel> {
        let stringInfo: string = JSON.stringify(info);
        let key = Redis.getPinKey(phoneNumber);
        return Redis.getClient().setAsync(key, stringInfo)
        .then(result => {
            return Redis.getClient().expireAsync(key, info.expiryTime);
        })
        .then(result => {
            return info;
        });
    }

    public generate(phoneNumber: string, ttl: number = PIN_CONFIG.EXPIRY_TIME): Promise<PinInfoModel> {
        if (!phoneNumber) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return this.getInfo(phoneNumber)
        .then(pinInfo => {
            if (!pinInfo) {
                pinInfo = new PinInfoModel();
                pinInfo.pin = process.env.NODE_ENV !== "development" ? Utils.randomPin(PIN_CONFIG.NUMBER_OF_CHARACTER) : "3333";
                pinInfo.leftCount = PIN_CONFIG.COUNT_LIMIT;
                pinInfo.expiryTime = ttl;
            }
            if (pinInfo.leftCount <= 0) {
                throw new ExceptionModel(
                    ErrorCode.AUTHENTICATION.LIMIT_QUOTA.CODE,
                    ErrorCode.AUTHENTICATION.LIMIT_QUOTA.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            pinInfo.leftCount--;
            return pinInfo;
        })
        .then(pinInfo => {
            return this.saveInfo(phoneNumber, pinInfo);
        });
    }

    public verify(phoneNumber: string, pin: string): Promise<any> {
        return this.getInfo(phoneNumber)
        .then(pinInfo => {
            if (!pinInfo) {
                throw new ExceptionModel(
                    ErrorCode.AUTHENTICATION.VERIFY_PHONE_CODE_EXPIRE.CODE,
                    ErrorCode.AUTHENTICATION.VERIFY_PHONE_CODE_EXPIRE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if (pinInfo.pin !== pin) {
                throw new ExceptionModel(
                    ErrorCode.AUTHENTICATION.INVALID_VERIFY_PHONE_CODE.CODE,
                    ErrorCode.AUTHENTICATION.INVALID_VERIFY_PHONE_CODE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return pinInfo;
        });
    }

}

export default PinService;

