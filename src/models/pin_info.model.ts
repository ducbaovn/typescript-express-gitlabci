/**
 * Created by ducbaovn on 17/05/17.
 */

import {BaseModel} from "./base.model";

export class PinInfoModel extends BaseModel {

    public pin: string;
    public leftCount: number;
    public expiryTime: number;

}

export default PinInfoModel;
