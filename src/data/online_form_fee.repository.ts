import {BaseRepository} from "./base.repository";
import {OnlineFormFeeDto} from "./sql/models";
import {OnlineFormFeeModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class OnlineFormFeeRepository extends BaseRepository<OnlineFormFeeDto, OnlineFormFeeModel> {
    constructor() {
        super(OnlineFormFeeDto, OnlineFormFeeModel, {
            fromDto: OnlineFormFeeModel.fromDto,
            toDto: OnlineFormFeeModel.toDto,
        });
    }

    public deleteBySubCategoryId(subCategoryId: string, related = [], filters = []): Promise<any[]> {
        return this.deleteByQuery(q => {
            q.where(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID, subCategoryId);
        });
    }
}
export default OnlineFormFeeRepository;
