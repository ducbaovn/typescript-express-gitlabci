/**
 * Created by ducbaovn on 07/06/17.
 */

import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import { BaseService } from "./base.service";
import { SmsModel } from "../models";
import { SmsRepository } from "../data";
import * as Schema from "../data/sql/schema";
import { DELETE_STATUS, ENABLE_STATUS, SMS_TYPE, MESSAGE_INFO, TIME_ZONE } from "../libs/constants";
import { SMS } from "../libs";


export class SmsService extends BaseService<SmsModel, typeof SmsRepository> {
    constructor() {
        super(SmsRepository);
    }

    public send(area: string, phoneNumber: string, message: string, type: string = SMS_TYPE.OTP, userManagerId?: string, getQuotationId?: string): Promise<string> {
        return SMS.send(area, phoneNumber, message)
            .then(smsId => {
                let smsInfo = new SmsModel();
                smsInfo.to = phoneNumber;
                smsInfo.type = type;
                smsInfo.userManagerId = userManagerId;
                smsInfo.getQuotationId = getQuotationId;
                smsInfo.smsId = smsId;
                return SmsRepository.insert(smsInfo);
            })
            .then(smsDto => {
                return smsDto.id;
            });
    }


    /**
     *
     * @param phoneNumber
     * @param pin
     * @returns {Promise<string>}
     */
    public sendPin(area: string, phoneNumber: string, pin: string): Promise<string> {
        return this.send(area, phoneNumber, `${MESSAGE_INFO.MI_SMS_SEND_ACCESS_CODE} ${pin}`);
    }

    /**
     * Count sms by type and condoId
     *
     * @param type
     * @param startDate
     * @param endDate
     * @returns {Promise<number>}
     */
    public countSms(type: string, condoId: string, startDate: Date, endDate: Date): Promise<number> {
        return SmsRepository.countByQuery(q => {
            q.innerJoin(Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME, `${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.ID}`);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE}`, type);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, ">", startDate);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "<", endDate);
        });
    }


    /**
     * List Get-quotation category group by subcategory and createdDate
     *
     * @param type
     * @param startDate
     * @param endDate
     * @returns {Promise<number>}
     */
    public getQuotationReport(condoId: string, startDate: Date, endDate: Date, timezone = TIME_ZONE.TIME_ZONE_DEFAULT): Promise<any> {
        return SmsRepository.findByQuery(q => {
            q.select(`${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME}`, SmsRepository.raw(`date_trunc('day', ${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE} at time zone '${timezone}') created_day`));
            q.innerJoin(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME, `${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID}`, `${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID}`);
            q.innerJoin(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME, `${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID}`);
            q.innerJoin(Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME, `${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.ID}`);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE}`, SMS_TYPE.GET_QUOTATION);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, ">", startDate);
            q.where(`${Schema.SMS_TABLE_SCHEMA.TABLE_NAME}.${Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "<", endDate);
            q.groupByRaw(`${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME}, created_day`);
        });
    }

}

export default SmsService;
