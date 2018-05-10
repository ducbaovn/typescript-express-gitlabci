/**
 * Created by ducbaovn on 05/05/17.
 */

import {BaseRepository} from "./base.repository";
import {GetQuotationSubcategoryDto} from "./sql/models";
import {GetQuotationSubcategoryModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class GetQuotationSubcategoryRepository extends BaseRepository<GetQuotationSubcategoryDto, GetQuotationSubcategoryModel> {
    constructor() {
        super(GetQuotationSubcategoryDto, GetQuotationSubcategoryModel, {
            fromDto: GetQuotationSubcategoryModel.fromDto,
            toDto: GetQuotationSubcategoryModel.toDto,
        });
    }
}
export default GetQuotationSubcategoryRepository;
