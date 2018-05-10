/**
 * Created by thanhphan on 4/12/17.
 */
import {BaseRepository} from "./base.repository";
import {AdvertisingImageDto} from "./sql/models";
import {AdvertisingImageModel} from "../models";

export class AdvertisingImageRepository extends BaseRepository<AdvertisingImageDto, AdvertisingImageModel> {
    constructor() {
        super(AdvertisingImageDto, AdvertisingImageModel, {
            fromDto: AdvertisingImageModel.fromDto,
            toDto: AdvertisingImageModel.toDto,
        });
    }
}

export default AdvertisingImageRepository;
