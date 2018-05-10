import * as _ from "lodash";
import * as momentTz from "moment-timezone";
import { BOOKING_STATUS, DEPOSIT_STATUS, PAYMENT_STATUS } from "../libs/constants";
import { BOOKING_TABLE_SCHEMA } from "../data/sql/schema";
import { BaseModel } from "./base.model";
import {
    BlockDto, BookingDto, BookingItemDto, CondoDto, TransactionHistoryDto, UnitDto,
    UserDto
} from "../data/sql/models";
import { BlockModel } from "./block.model";
import { BookingItemModel } from "./booking_item.model";
import { CondoModel } from "./condo.model";
import { FloorModel } from "./floor.model";
import { UnitModel } from "./unit.model";
import { UserModel } from "./user.model";
import {TransactionHistoryModel} from "./transaction_history.model";

export class BookingModel extends BaseModel {
    public eventStartDate: momentTz.Moment;
    public eventEndDate: momentTz.Moment;
    public receiptNo: string;
    public paymentAmount: number;
    public depositAmount: number;
    public paymentStatus: string;
    public userId: string;
    public condoId: string;
    public blockId: string;
    public floorId: string;
    public unitId: string;
    public note: string;
    public bookingStatus: string;           // Confirmed, Awaiting Payment, Cancelled.
    public depositStatus: string;           // Pending, Returned, Forfeited
    public payByCash: boolean;

    public items: BookingItemModel[];
    public user: UserModel;
    public condo: CondoModel;
    public block: BlockModel;
    public floor: FloorModel;
    public unit: UnitModel;
    public transaction: TransactionHistoryModel;

    // Support display on mobile apps.
    public totalAmount: number;
    public isExempt: boolean;

    public static toResponse(modal: BookingModel): any {
    }

    public static fromRequest(data: any): BookingModel {
        let model: BookingModel = new BookingModel();

        if (data != null) {
            model.userId = BaseModel.getString(data.userId);
            model.condoId = BaseModel.getString(data.condoId);
            model.note = BaseModel.getString(data.note);
            model.depositAmount = BaseModel.getNumber(data.depositAmount);
            model.paymentAmount = BaseModel.getNumber(data.paymentAmount);
            model.totalAmount = BaseModel.getNumber(data.totalAmount);
            model.isDeleted = BaseModel.getBoolean(data.isDeleted, false);      // Support for cancel booking.

            if (data.items != null) {
                model.items = [];

                data.items.forEach(element => {
                    let item = BookingItemModel.fromRequest(element);
                    model.items.push(item);
                });
            }
        }

        return model;
    }

    public static fromDto(dto: BookingDto, filters = []): BookingModel {
        let model: BookingModel = null;
        if (dto != null) {
            model = new BookingModel();
            model.id = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.ID));
            // model.isEnable = BaseModel.getBoolean(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.condoId = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.blockId = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.BLOCK_ID));
            model.floorId = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.FLOOR_ID));
            model.unitId = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID));
            model.userId = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.USER_ID));
            model.eventStartDate = BaseModel.getDate(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE));
            model.eventEndDate = BaseModel.getDate(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.EVENT_END_DATE));
            model.receiptNo = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.RECEIPT_NO));
            model.paymentAmount = BaseModel.getNumber(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT));
            model.depositAmount = BaseModel.getNumber(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT));
            model.paymentStatus = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS));
            model.note = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.NOTE));
            model.depositStatus = BaseModel.getString(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS));
            model.payByCash = BaseModel.getBoolean(dto.get(BOOKING_TABLE_SCHEMA.FIELDS.PAY_BY_CASH));

            if (model.isDeleted) {
                model.bookingStatus = BOOKING_STATUS.CANCELLED;
            } else {
                if (model.paymentStatus === PAYMENT_STATUS.PAID || model.paymentStatus === PAYMENT_STATUS.NOT_APPLICABLE) {
                    model.bookingStatus = BOOKING_STATUS.CONFIRMED;
                } else if (model.paymentStatus === PAYMENT_STATUS.CANCELLED) {
                    model.bookingStatus = BOOKING_STATUS.CANCELLED;
                } else {
                    model.bookingStatus = BOOKING_STATUS.AWAITING_PAYMENT;
                }
            }

            // Total amount.
            model.totalAmount = model.paymentAmount + model.depositAmount;

            let items: any = dto.related("items");
            if (items != null && items.models != null) {
                let itemDtoArr: BookingItemDto[] = items.models as BookingItemDto[];
                model.items = [];

                itemDtoArr.forEach(dto => {
                    let itemModel: BookingItemModel = BookingItemModel.fromDto(dto, filters);

                    itemModel.isAllowCancel = true;
                    if (model.bookingStatus === BOOKING_STATUS.CANCELLED) {
                        itemModel.isAllowCancel = false;
                    }

                    model.items.push(itemModel);
                });
            }

            let user: any = dto.related("user");
            if (user != null && user.id != null) {
                let userDto: UserDto = user as UserDto;
                model.user = UserModel.fromDto(userDto, [...filters, "password"]);
            }

            let condo: any = dto.related("condo");
            if (condo != null && condo.id != null) {
                let condoDto: CondoDto = condo as CondoDto;
                model.condo = CondoModel.fromDto(condoDto, [...filters, "publicKey", "privateKey", "merchantId", "latitude", "longitude"]);
            }

            let block: any = dto.related("block");
            if (block != null && block.id != null) {
                let blockDto: BlockDto = block as BlockDto;
                model.block = BlockModel.fromDto(blockDto, filters);
            }

            let unit: any = dto.related("unit");
            if (unit != null && unit.id != null) {
                let unitDto: UnitDto = unit as UnitDto;
                model.unit = UnitModel.fromDto(unitDto, filters);
            }

            let transaction: any = dto.related("transaction");
            if (transaction != null && transaction.id != null) {
                let transactionDto: TransactionHistoryDto = transaction as TransactionHistoryDto;
                model.transaction = TransactionHistoryModel.fromDto(transactionDto, filters);
            }

            BaseModel.filter(model, filters);
        }

        return model;
    }

    public static toDto(model: BookingModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.eventStartDate != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.EVENT_START_DATE] = model.eventStartDate;
            }

            if (model.eventEndDate != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.EVENT_END_DATE] = model.eventEndDate;
            }

            if (model.receiptNo != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.RECEIPT_NO] = model.receiptNo;
            }

            if (model.paymentAmount != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT] = model.paymentAmount;
            }

            if (model.depositAmount != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT] = model.depositAmount;
            }

            if (model.paymentStatus != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS] = model.paymentStatus;
            }

            if (model.depositStatus != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS] = model.depositStatus;
            }

            if (model.userId != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
            }

            if (model.condoId != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
            }

            if (model.blockId != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.BLOCK_ID] = model.blockId;
            }

            if (model.floorId != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.FLOOR_ID] = model.floorId;
            }

            if (model.unitId != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
            }

            if (model.note != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.NOTE] = model.note;
            }

            if (model.payByCash != null) {
                dto[BOOKING_TABLE_SCHEMA.FIELDS.PAY_BY_CASH] = model.payByCash;
            }
        }

        return dto;
    }
}

export default BookingModel;
