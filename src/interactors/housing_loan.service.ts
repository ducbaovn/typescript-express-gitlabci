/**
 * Created by davidho on 2/24/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, HousingLoanModel} from "../models";
import {HousingLoanRepository, UserRepository} from "../data";
import {HousingLoanDto} from "../data/sql/models";
import {ExceptionModel} from "../models/exception.model";
import {ErrorCode, HttpStatus, Mailer} from "../libs/index";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS, DEFAULT_HOUSING_LOAN} from "../libs/constants";
import {UserModel} from "../models/user.model";

export class HousingLoanService extends BaseService<HousingLoanModel, typeof HousingLoanRepository> {
    constructor() {
        super(HousingLoanRepository);
    }

    /**
     * get user profile by id
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public requestQuote(userId: string, related = [], filters = []): Promise<boolean> {
        let userInfo: UserModel;
        return UserRepository.findOne(userId, ["condo", "unit.floor.block"], filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                userInfo = object;
                return HousingLoanRepository.findOneByQuery(q => {
                    q.where(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.andWhere(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    q.orderBy(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                }, related, filters);
            })
            .then(object => {
                // send email quote
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                if (!object.emails || object.emails.length === 0) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.REQUEST_QUOTE_FAIL.CODE,
                        ErrorCode.RESOURCE.REQUEST_QUOTE_FAIL.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
                // send housing loan request - received
                Mailer.sendHousingLoanRequest(userInfo);
                // send new housing loan request
                object.emails.forEach(email => {
                    if (email) {
                        Mailer.sendNewHousingLoanRequest(email, userInfo);
                    }
                });

                return true;
            });
    }

    public detail(related = [], filters = []): Promise<HousingLoanModel> {
        return HousingLoanRepository.findOneByQuery(q => {
            q.where(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
        }, related, filters)
            .then(object => {
                if (object === null) {
                    let housingLoan = new HousingLoanModel();
                    housingLoan.yr1 = DEFAULT_HOUSING_LOAN.YEAR1;
                    housingLoan.yr2 = DEFAULT_HOUSING_LOAN.YEAR2;
                    housingLoan.yr3 = DEFAULT_HOUSING_LOAN.YEAR3;
                    housingLoan.yr4 = DEFAULT_HOUSING_LOAN.YEAR4;
                    housingLoan.yrOther = DEFAULT_HOUSING_LOAN.YEAR_OTHER;
                    housingLoan.rateType = DEFAULT_HOUSING_LOAN.TERMS;
                    housingLoan.legalSubsidy = DEFAULT_HOUSING_LOAN.BONUS;
                    housingLoan.message = DEFAULT_HOUSING_LOAN.MESSAGE;
                    return HousingLoanRepository.insertGet(housingLoan);
                }
                return object;
            });
    }

    public update(obj: HousingLoanModel, related = [], filters = []): Promise<HousingLoanDto> {
        return HousingLoanRepository.update(obj);
    }
}

export default HousingLoanService;
