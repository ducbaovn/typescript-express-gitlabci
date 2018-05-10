/**
 * Created by davidho on 2/6/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {HousingLoanDto} from "../data/sql/models";

export class HousingLoanModel extends BaseModel {
    public yr1: string;
    public yr2: string;
    public yr3: string;
    public yr4: string;
    public yrOther: string;
    public rateType: string;
    public legalSubsidy: string;
    public message: string;
    public emails: string[];

    public static fromDto(dto: HousingLoanDto, filters: string[] = []): HousingLoanModel {
        let model: HousingLoanModel = new HousingLoanModel();
        if (dto != null) {
            model.id = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.yr1 = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR1));
            model.yr2 = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR2));
            model.yr3 = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR3));
            model.yr4 = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR4));
            model.yrOther = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR_OTHER));

            model.rateType = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.RATE_TYPE));
            model.legalSubsidy = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.LEGAL_SUBSIDY));
            model.message = BaseModel.getString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.MESSAGE));
            model.emails = BaseModel.getArrayString(dto.get(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.EMAILS));
        }
        HousingLoanModel.filter(model, filters);
        return model;
    }

    public static toDto(model: HousingLoanModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isDeleted != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.isEnable != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.yr1 != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR1] = model.yr1;
        }

        if (model.yr2 != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR2] = model.yr2;
        }

        if (model.yr3 != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR3] = model.yr3;
        }

        if (model.yr4 != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR4] = model.yr4;
        }

        if (model.yrOther != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.YR_OTHER] = model.yrOther;
        }

        if (model.rateType != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.RATE_TYPE] = model.rateType;
        }

        if (model.legalSubsidy != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.LEGAL_SUBSIDY] = model.legalSubsidy;
        }

        if (model.message != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.MESSAGE] = model.message;
        }

        if (model.emails != null) {
           dto[Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.EMAILS] = model.emails;
        }

        return dto;
    }


    public static fromRequest(req: express.Request): HousingLoanModel {
        let model: HousingLoanModel = new HousingLoanModel();
        if (req != null) {
            model.yr1 = this.getString(req.body.yr1);
            model.yr2 = this.getString(req.body.yr2);
            model.yr3 = this.getString(req.body.yr3);
            model.yr4 = this.getString(req.body.yr4);
            model.yrOther = this.getString(req.body.yrOther);
            model.rateType = this.getString(req.body.rateType);
            model.legalSubsidy = this.getString(req.body.legalSubsidy);
            model.message = this.getString(req.body.message);
            model.emails = this.getArrayString(req.body.emails);
        }
        return model;
    }
}

export default HousingLoanModel;
