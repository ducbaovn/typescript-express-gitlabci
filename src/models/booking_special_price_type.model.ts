import { BOOKING_SPECIAL_PRICE_TYPE } from "./../libs/constants";
import * as Schema from "../data/sql/schema";
import * as Bluebird from "bluebird";
import {BaseModel} from "./base.model";

export class BookingSpecialPriceTypeModel extends BaseModel {
    public type: string;

    public static getAll(): any {
        let result: BookingSpecialPriceTypeModel[] = [];
        let types = BOOKING_SPECIAL_PRICE_TYPE;
        for (let key in types) {
            let object = new BookingSpecialPriceTypeModel();
            object.type = types[key];
            result.push(object);
        }
        return result;
    }
}

export default BookingSpecialPriceTypeModel;
