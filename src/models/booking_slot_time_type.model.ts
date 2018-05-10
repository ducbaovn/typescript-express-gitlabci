import { BOOKING_SLOT_TIME_TYPE } from "./../libs/constants";
import * as Schema from "../data/sql/schema";
import * as Bluebird from "bluebird";
import {BaseModel} from "./base.model";

export class BookingSlotTimeTypeModel extends BaseModel {
    public type: string;

    public static getAll(): any {
        let result: BookingSlotTimeTypeModel[] = [];
        let types = BOOKING_SLOT_TIME_TYPE;
        for (let key in types) {
            let object = new BookingSlotTimeTypeModel();
            object.type = types[key];
            result.push(object);
        }
        return result;
    }
}

export default BookingSlotTimeTypeModel;
