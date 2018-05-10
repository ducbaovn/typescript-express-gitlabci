/**
 * Created by davidho on 3/1/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {UnitModel} from "./unit.model";
import {UserModel} from "./user.model";
import {CondoModel} from "./condo.model";
import {OnlineFormRequestModel} from "./online_form_request.model";
import {OnlineFormSubCategoryModel} from "./online_form_sub_category.model";
import {OnlineFormRequestItemsDto, OnlineFormRequestDto, UserDto, CondoDto, UnitDto, OnlineFormDto, OnlineFormSubCategoryDto} from "../data/sql/models";

export class OnlineFormRequestItemsModel extends BaseModel {

    public remarks: string;
    public serialNumber: string;

    public userId: string;
    public price: number;
    public vehicleNumber: string;
    public iuNumber: string;
    public proofOfOwnershipPhoto: string;
    public proofOfCar: string;
    public status: string;
    public transactionId: string;
    public condoId: string;
    public unitId: string;
    public payByCash: boolean;
    public onlineFormSubCategoryId: string;

    public user: UserModel;
    public condo: CondoModel;
    public unit: UnitModel;
    public onlineFormSubCategory: OnlineFormSubCategoryModel;

    public static fromDto(dto: OnlineFormRequestItemsDto, filters: string[] = []): OnlineFormRequestItemsModel {
        let model: OnlineFormRequestItemsModel = null;
        if (dto != null) {
            model = new OnlineFormRequestItemsModel();
            model.id = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.remarks = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.REMARKS));
            model.serialNumber = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.SERIAL_NUMBER));

            model.userId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.USER_ID));
            model.price = BaseModel.getNumber(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PRICE));
            model.vehicleNumber = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.VEHICLE_NUMBER));
            model.iuNumber = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IU_NUMBER));
            model.status = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.STATUS));
            model.transactionId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.TRANSACTION_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.unitId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UNIT_ID));
            model.payByCash = BaseModel.getBoolean(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PAY_BY_CASH));
            model.onlineFormSubCategoryId = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID));
            model.proofOfOwnershipPhoto = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_OWNERSHIP_PHOTO));
            model.proofOfCar = BaseModel.getString(dto.get(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_CAR));

            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, filters);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;
            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            let unitRelation: UnitDto = dto.related("unit") as UnitDto;
            if (unitRelation != null && unitRelation.id != null) {
                let unitModel = UnitModel.fromDto(unitRelation, filters);
                if (unitModel != null) {
                    model.unit = unitModel;
                }
            }

            let onlineFormSubCategoryRelation: OnlineFormSubCategoryDto = dto.related("onlineFormSubCategory") as OnlineFormSubCategoryDto;
            if (onlineFormSubCategoryRelation != null && onlineFormSubCategoryRelation.id != null) {
                let onlineFormSubCategoryModel = OnlineFormSubCategoryModel.fromDto(onlineFormSubCategoryRelation, filters);
                if (onlineFormSubCategoryModel != null) {
                    model.onlineFormSubCategory = onlineFormSubCategoryModel;
                }
            }
        }
        OnlineFormRequestItemsModel.filter(model, filters);
        return model;
    }

    public static toDto(model: OnlineFormRequestItemsModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.remarks != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.REMARKS] = model.remarks;
        }
        if (model.serialNumber != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.SERIAL_NUMBER] = model.serialNumber;
        }
        if (model.status != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }
        if (model.userId != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.price != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PRICE] = model.price;
        }
        if (model.vehicleNumber != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.VEHICLE_NUMBER] = model.vehicleNumber;
        }
        if (model.iuNumber != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.IU_NUMBER] = model.iuNumber;
        }
        if (model.proofOfOwnershipPhoto != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_OWNERSHIP_PHOTO] = model.proofOfOwnershipPhoto;
        }
        if (model.proofOfCar != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_CAR] = model.proofOfCar;
        }
        if (model.status != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }
        if (model.transactionId != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.TRANSACTION_ID] = model.transactionId;
        }
        if (model.condoId != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.unitId != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
        }
        if (model.payByCash != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PAY_BY_CASH] = model.payByCash;
        }
        if (model.onlineFormSubCategoryId != null) {
            dto[Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID] = model.onlineFormSubCategoryId;
        }
        return dto;
    }

    public static fromOnlineFormRequest(object: OnlineFormRequestModel): OnlineFormRequestItemsModel[] {
        let array: OnlineFormRequestItemsModel[] = [];
        for (let i = 0; i < object.numberOfItems; i++) {
            let item = new OnlineFormRequestItemsModel();
            item.userId = object.userId;
            item.price = object.price;
            item.vehicleNumber = object.vehicleNumber;
            item.iuNumber = object.iuNumber;
            item.proofOfOwnershipPhoto = object.proofOfOwnershipPhoto;
            item.proofOfCar = object.proofOfCar;
            item.payByCash = object.payByCash;
            item.serialNumber = object.serialNumber;
            item.onlineFormSubCategoryId = object.onlineFormSubCategoryId;
            array.push(item);
        }
        return array;
    }
}

export default OnlineFormRequestItemsModel;
