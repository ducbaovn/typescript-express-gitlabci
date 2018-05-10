/**
 * Created by davidho on 2/6/17.
 */

import {BaseRepository} from "./base.repository";
import {HousingLoanDto} from "./sql/models";
import {HousingLoanModel} from "../models";

export class HousingLoanRepository extends BaseRepository<HousingLoanDto, HousingLoanModel> {
    constructor() {
        super(HousingLoanDto, HousingLoanModel, {
            fromDto: HousingLoanModel.fromDto,
            toDto: HousingLoanModel.toDto,
        });
    }
}
export  default HousingLoanRepository;
