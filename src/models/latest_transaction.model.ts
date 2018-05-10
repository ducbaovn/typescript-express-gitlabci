/**
 * Created by davidho on 2/6/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {Utils} from "../libs";
import {LATEST_TRANSACTION_TYPE} from "../libs/constants";
import {BaseModel} from "./base.model";
import {CondoDto, LatestTransactionDto} from "../data/sql/models";
import {CondoModel} from "./condo.model";

export class LatestTransactionModel extends BaseModel {
    public transactionDate: momentTz.Moment;
    public block: string;
    public unitNumber: string;
    public size: string;
    public price: string;
    public psf: string;
    public type: string;
    public condoId: string;
    public condo: CondoModel;

    public static fromDto(dto: LatestTransactionDto, filters: string[] = []): LatestTransactionModel {
        let model: LatestTransactionModel = null;
        if (dto != null) {
            model = new LatestTransactionModel();
            model.id = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.transactionDate =  BaseModel.getDate(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE));
            model.block = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.BLOCK));
            model.unitNumber = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UNIT_NUMBER));
            model.size = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.SIZE));
            model.price = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PRICE));
            model.psf = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PSF));
            model.type = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE));
            model.condoId = BaseModel.getString(dto.get(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID));

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;

            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, [...filters]);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }
        }
        LatestTransactionModel.filter(model, filters);
        return model;
    }

    public static fromRequest(req: express.Request): LatestTransactionModel {
        let ret = new LatestTransactionModel();
        if (req != null && req.body != null) {
            ret.transactionDate = this.getDate(req.body.transactionDate);
            ret.block = this.getString(req.body.block);
            ret.unitNumber = this.getString(req.body.unitNumber);
            ret.size = this.getString(req.body.size);
            ret.price = this.getString(req.body.price);
            ret.psf = this.getString(req.body.psf);
            ret.type = this.getString(req.body.type);
            ret.condoId = this.getString(req.body.condoId);
        }
        return ret;
    }


    public static toDto(model: LatestTransactionModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
           dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.transactionDate != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE] = model.transactionDate;
        }
        if (model.block != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.BLOCK] = model.block;
        }
        if (model.unitNumber != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UNIT_NUMBER] = model.unitNumber;
        }
        if (model.size != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.SIZE] = model.size;
        }
        if (model.price != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PRICE] = model.price;
        }
        if (model.psf != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PSF] = model.psf;
        }
        if (model.type != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }
        if (model.condoId != null) {
            dto[Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        return dto;
    }

    public static showPrice(list: LatestTransactionModel[]): LatestTransactionModel[] {
        for (let latestTransaction of list) {
            let size = parseFloat(latestTransaction.size);
            let price = parseFloat(latestTransaction.price);
            let psf = parseFloat(latestTransaction.psf);
            latestTransaction.size = `${Utils.numberWithCommas(size)} sqft`;
            if (latestTransaction.type === LATEST_TRANSACTION_TYPE.RENT) {
                latestTransaction.price = `$${Utils.numberWithCommas(price)} pm`;
            }
            if (latestTransaction.type === LATEST_TRANSACTION_TYPE.SALE) {
                latestTransaction.price = price >= 1 ? `$${Utils.numberWithCommas(price)} M` : `$${Utils.numberWithCommas(price * 1000)} K`;
                latestTransaction.psf = `$${Utils.numberWithCommas(psf)} psf`;
            }
        }
        return list;
    }
}

export default LatestTransactionModel;
