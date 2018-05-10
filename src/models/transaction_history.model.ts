import * as _ from "lodash";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { BookingDto, CondoDto, OnlineFormDto, TransactionHistoryDto, UserDto } from "../data/sql/models";
import { BookingModel } from "./booking.model";
import { CondoModel } from "./condo.model";
import { OnlineFormModel } from "./online_form.model";
import { TRANSACTION_HISTORY_TABLE_SCHEMA } from "../data/sql/schema";
import { TRANSACTION_ITEM_TYPE } from "../libs/constants";
import { UserModel } from "./user.model";

export class TransactionHistoryModel extends BaseModel {
    public condoId: string;
    public userId: string;
    public transactionId: string;
    public transactionDate: momentTz.Moment;
    public itemId: string;
    public itemType: string;
    public amount: number;
    public gateway: string;
    public customerId: string;      // payment gateway customerId.
    public token: string;           // card token
    public payByCash: boolean;

    public condo: CondoModel;       // Mapping with Condo info.
    public user: UserModel;         // Mapping with User info.
    public item: any;               // Mapping with Booking, OnlineForm.
    public name: string;            // Mapping with Facility, OnlineForm name.
    public firstName: string;            // Mapping with User First Name.
    public lastName: string;            // Mapping with User Last Name.
    public unitNumber: string;            // Mapping with Unit Number.

    public static toResponse(modal: TransactionHistoryModel): any {
    }

    public static fromRequest(data: any): TransactionHistoryModel {
        let model: TransactionHistoryModel = new TransactionHistoryModel();

        if (data != null) {
            model.condoId = BaseModel.getString(data.condoId);
            model.userId = BaseModel.getString(data.userId);
            model.itemId = BaseModel.getString(data.itemId);
            model.itemType = BaseModel.getString(data.itemType);
            model.amount = BaseModel.getNumber(data.amount, 0);
            model.token = BaseModel.getString(data.token);
            model.payByCash = BaseModel.getBoolean(data.payByCash);
        }

        return model;
    }

    public static fromDto(dto: TransactionHistoryDto, filters = []): TransactionHistoryModel {
        let model: TransactionHistoryModel = null;

        if (dto != null) {
            model = new TransactionHistoryModel();

            model.id = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ID));
            // model.isEnable = BaseModel.getBoolean(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            // model.isDeleted = BaseModel.getBoolean(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            // model.createdDate = BaseModel.getDate(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            // model.updatedDate = BaseModel.getDate(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.condoId = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.userId = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.USER_ID));
            model.transactionId = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_ID));
            model.transactionDate = BaseModel.getDate(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE));
            model.itemId = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID));
            model.itemType = BaseModel.getString(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_TYPE));
            model.amount = BaseModel.getNumber(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT));
            model.payByCash = BaseModel.getBoolean(dto.get(TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.PAY_BY_CASH));

            let subFilters = _.uniqBy(
                [...filters, "isEnable", "isDeleted", "createdDate", "updatedDate"],
                (key) => {
                    return key;
                }
            );

            let condo: any = dto.related("condo");
            if (condo != null && condo.id != null) {
                let condoDto: CondoDto = condo as CondoDto;

                model.condo = CondoModel.fromDto(condoDto, [...subFilters, "publicKey", "privateKey", "merchantId", "latitude", "longitude"]);
            }

            let user: any = dto.related("user");
            if (user != null && user.id != null) {
                let userDto: UserDto = user as UserDto;

                model.user = UserModel.fromDto(userDto, [...subFilters, "password"]);
            }

            // Mapping with item relationship: Booking, Online Form
            if (model.itemType === TRANSACTION_ITEM_TYPE.BOOK_FACILITY) {
                let bookingRelated: any = dto.related("bookFacility");

                if (bookingRelated != null && bookingRelated.id != null) {
                    let bookingDto: BookingDto = bookingRelated as BookingDto;

                    model.item = BookingModel.fromDto(bookingDto, [...subFilters]);
                }
            } else if (model.itemType === TRANSACTION_ITEM_TYPE.ONLINE_FORM) {
                let onlineFormRelated: any = dto.related("onlineForm");

                if (onlineFormRelated != null && onlineFormRelated.id != null) {
                    let onlineFormDto: OnlineFormDto = onlineFormRelated as OnlineFormDto;

                    model.item = OnlineFormModel.fromDto(onlineFormDto, [...subFilters]);
                }
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: TransactionHistoryModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.condoId != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
            }

            if (model.userId != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
            }

            if (model.transactionId != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_ID] = model.transactionId;
            }

            if (model.transactionDate != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE] = model.transactionDate;
            }

            if (model.itemId != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID] = model.itemId;
            }

            if (model.itemType != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_TYPE] = model.itemType;
            }

            if (model.amount != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.AMOUNT] = model.amount;
            }

            if (model.payByCash != null) {
                dto[TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.PAY_BY_CASH] = model.payByCash;
            }
        }

        return dto;
    }
}

export default TransactionHistoryModel;
