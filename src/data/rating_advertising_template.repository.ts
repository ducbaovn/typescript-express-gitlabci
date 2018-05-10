/**
 * Created by ducbaovn on 04/05/17.
 */
import {BaseRepository} from "./base.repository";
import {RatingAdvertisingTemplateDto} from "./sql/models";
import {RatingAdvertisingTemplateModel} from "../models";

export class RatingAdvertisingTemplateRepository extends BaseRepository<RatingAdvertisingTemplateDto, RatingAdvertisingTemplateModel> {
    constructor() {
        super(RatingAdvertisingTemplateDto, RatingAdvertisingTemplateModel, {
            fromDto: RatingAdvertisingTemplateModel.fromDto,
            toDto: RatingAdvertisingTemplateModel.toDto,
        });
    }
}
export default RatingAdvertisingTemplateRepository;
