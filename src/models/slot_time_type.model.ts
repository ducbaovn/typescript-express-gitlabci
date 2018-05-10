import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {SlotTimeTypeDto} from "../data/sql/models";
import {BOOKING_SLOT_TIME_TYPE} from "../libs/constants";

export class SlotTimeTypeModel extends BaseModel {
    public type: string;

    public static getAll(): any {
        let result: SlotTimeTypeModel[] = [];
        let types = BOOKING_SLOT_TIME_TYPE;
        for (let key in types) {
            let object = new SlotTimeTypeModel();
            object.type = types[key];
            result.push(object);
        }
        return result;
    }
}

export default SlotTimeTypeModel;
