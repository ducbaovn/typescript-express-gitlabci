/**
 * Created by ducbaovn on 05/05/17.
 */

import {BaseRepository} from "./base.repository";
import {GetQuotationServiceDto} from "./sql/models";
import {GetQuotationServiceModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class GetQuotationServiceRepository extends BaseRepository<GetQuotationServiceDto, GetQuotationServiceModel> {
    constructor() {
        super(GetQuotationServiceDto, GetQuotationServiceModel, {
            fromDto: GetQuotationServiceModel.fromDto,
            toDto: GetQuotationServiceModel.toDto,
        });
    }
}
export default GetQuotationServiceRepository;
