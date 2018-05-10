/**
 * Created by ducbaovn on 04/05/17.
 */

import {BaseRepository} from "./base.repository";
import {SellMyCarDto} from "./sql/models";
import {SellMyCarModel} from "../models";

export class SellMyCarRepository extends BaseRepository<SellMyCarDto, SellMyCarModel> {
    constructor() {
        super(SellMyCarDto, SellMyCarModel, {
            fromDto: SellMyCarModel.fromDto,
            toDto: SellMyCarModel.toDto,
        });
    }
}
export default SellMyCarRepository;
