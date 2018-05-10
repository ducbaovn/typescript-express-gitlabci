/**
 * Created by davidho on 3/1/17.
 */

import {BaseRepository} from "./base.repository";
import {OnlineFormRequestDto} from "./sql/models";
import {OnlineFormRequestModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, ONLINE_FORM_STATUS} from "../libs/constants";

export class OnlineFormRequestRepository extends BaseRepository<OnlineFormRequestDto, OnlineFormRequestModel> {

}

export  default OnlineFormRequestRepository;
