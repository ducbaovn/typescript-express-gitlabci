/**
 * Created by ducbaovn on 27/07/17.
 */

import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import { BaseService } from "./base.service";
import { EmailModel, UserManagerModel, CondoModel, ExceptionModel } from "../models";
import { EmailRepository } from "../data";
import * as Schema from "../data/sql/schema";
import { DELETE_STATUS, ENABLE_STATUS, SMS_TYPE, MESSAGE_INFO, TIME_ZONE, EMAIL_TEMPLATE, EMAIL_SUBJECT } from "../libs/constants";
import { Utils, Mailer, HttpStatus, ErrorCode } from "../libs";


export class EmailService extends BaseService<EmailModel, typeof EmailRepository> {
    constructor() {
        super(EmailRepository);
    }

    public sendGetQuotation(getQuotationInfo: any[], body: string, userManager: UserManagerModel): Promise<any> {
        return Promise.resolve()
        .then(() => {
            let customEmail = new EmailModel();
            customEmail.content = body;
            customEmail.subject = EMAIL_SUBJECT.GET_QUOTATION;
            return Promise.each(getQuotationInfo, info => {
                return Mailer.sendCustomEmailByManager(customEmail, info.email, userManager)
                .then(result => {
                    let emailInfo = new EmailModel();
                    emailInfo.to = info.email;
                    emailInfo.type = SMS_TYPE.GET_QUOTATION;
                    emailInfo.itemId = info.getQuotationId;
                    emailInfo.userManagerId = userManager.id;
                    emailInfo.partnerId = result.id;

                    return EmailRepository.insert(emailInfo);
                });
            });
        });
    }

    /**
     * Count email by type and condoId
     *
     * @param type
     * @param startDate
     * @param endDate
     * @returns {Promise<number>}
     */
    public countEmail(type: string, condoId: string, startDate: Date, endDate: Date): Promise<number> {
        return EmailRepository.countByQuery(q => {
            q.innerJoin(Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME, `${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.ID}`);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE}`, type);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, ">", startDate);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "<", endDate);
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
        return EmailRepository.findByQuery(q => {
            q.select(`${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME}`, EmailRepository.raw(`date_trunc('day', ${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE} at time zone '${timezone}') created_day`));
            q.innerJoin(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME, `${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID}`, `${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID}`);
            q.innerJoin(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME, `${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID}`);
            q.innerJoin(Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME, `${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID}`, `${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.ID}`);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE}`, SMS_TYPE.GET_QUOTATION);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, ">", startDate);
            q.where(`${Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME}.${Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE}`, "<", endDate);
            q.groupByRaw(`${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME}, created_day`);
        });
    }

}

export default EmailService;
