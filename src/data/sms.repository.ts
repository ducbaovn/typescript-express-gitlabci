/**
 * Created by ducbaovn on 08/05/17.
 */

import {BaseRepository} from "./base.repository";
import {SmsDto} from "./sql/models";
import {SmsModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class SmsRepository extends BaseRepository<SmsDto, SmsModel> {
    constructor() {
        super(SmsDto, SmsModel, {
            fromDto: SmsModel.fromDto,
            toDto: SmsModel.toDto,
        });
    }
}
export default SmsRepository;
