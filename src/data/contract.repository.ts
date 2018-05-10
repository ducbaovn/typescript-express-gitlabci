/**
 * Created by ducbaovn on 04/05/17.
 */

import {BaseRepository} from "./base.repository";
import {ContractDto} from "./sql/models";
import {ContractModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class ContractRepository extends BaseRepository<ContractDto, ContractModel> {
    constructor() {
        super(ContractDto, ContractModel, {
            fromDto: ContractModel.fromDto,
            toDto: ContractModel.toDto,
        });
    }
}
export default ContractRepository;
