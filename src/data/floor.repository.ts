/**
 * Created by davidho on 3/27/17.
 */

import {BaseRepository} from "./base.repository";
import {FloorDto} from "./sql/models";
import {FloorModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class FloorRepository extends BaseRepository<FloorDto, FloorModel> {
    constructor() {
        super(FloorDto, FloorModel, {
            fromDto: FloorModel.fromDto,
            toDto: FloorModel.toDto,
        });
    }
}
export  default FloorRepository;
