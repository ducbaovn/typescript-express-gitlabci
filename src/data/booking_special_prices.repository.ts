import {BaseRepository} from "./base.repository";
import {BookingSpecialPricesDto} from "./sql/models";
import {BookingSpecialPricesModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
export class BookingSpecialPricesRepository extends BaseRepository<BookingSpecialPricesDto, BookingSpecialPricesModel> {
    constructor() {
        super(BookingSpecialPricesDto, BookingSpecialPricesModel, {
            fromDto: BookingSpecialPricesModel.fromDto,
            toDto: BookingSpecialPricesModel.toDto,
        });
    }
}
export default BookingSpecialPricesRepository;
