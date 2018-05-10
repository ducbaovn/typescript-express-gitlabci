/**
 * Created by davidho on 2/27/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {BaseModel} from "./base.model";
import {CondoModel} from "./condo.model";
import {ONLINE_FORM} from "../libs/constants";
import {OnlineFormModel} from "./online_form.model";
import {OnlineFormSubCategoryModel} from "./online_form_sub_category.model";
import {OnlineFormRequestDto, UserDto, CondoDto, UnitDto, OnlineFormDto, OnlineFormSubCategoryDto} from "../data/sql/models";
import {UnitModel} from "./unit.model";
import {UserModel} from "./user.model";

export class OnlineFormRequestModel extends BaseModel {
    public userId: string;
    public price: number;
    public total: number;
    public vehicleNumber: string;
    public iuNumber: string;
    public proofOfOwnershipPhoto: string;
    public proofOfCar: string;
    public numberOfItems: number;
    public payByCash: boolean;
    public onlineFormSubCategoryId: string;
    public serialNumber: string;

    public static fromRequest(req: express.Request): OnlineFormRequestModel {
        let ret = new OnlineFormRequestModel();
        if (req != null && req.body != null) {
            ret.userId = this.getString(req.body.userId);
            ret.price = this.getNumber(req.body.price);
            ret.vehicleNumber = this.getString(req.body.vehicleNumber);
            ret.iuNumber = this.getString(req.body.iuNumber);
            ret.proofOfOwnershipPhoto = this.getString(req.body.proofOfOwnershipPhoto);
            ret.proofOfCar = this.getString(req.body.proofOfCar);
            ret.numberOfItems = this.getNumber(req.body.numberOfItems);
            ret.serialNumber = this.getString(req.body.serialNumber);
            ret.onlineFormSubCategoryId = this.getString(req.body.onlineFormSubCategoryId);
        }
        return ret;
    }

    public validateOnlineForm(categoryId: string): boolean {
        let result = true;

        switch (categoryId) {
            case ONLINE_FORM.ACCESS_CARD: {
                if (this.numberOfItems === 0) {
                    result = false;
                }
                break;
            }
            case ONLINE_FORM.CAR_LABEL:
            case ONLINE_FORM.TRANSPONDER: {
                if (this.vehicleNumber === "") {
                    result = false;
                }
            }
                break;
            case ONLINE_FORM.IU_REGISTRATION: {
                if (this.vehicleNumber === "" || this.iuNumber === "") {
                    result = false;
                }
            }
                break;
            case ONLINE_FORM.BICYCLE_TAG: {
                if (this.numberOfItems === 0) {
                    result = false;
                }
                break;
            }
            default:
                result = false;
        }

        return result;
    }


}

export default OnlineFormRequestModel;
