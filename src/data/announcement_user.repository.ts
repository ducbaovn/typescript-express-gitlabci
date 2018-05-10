/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {AnnouncementUserDto} from "./sql/models";
import {AnnouncementUserModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class AnnouncementUserRepository extends BaseRepository<AnnouncementUserDto, AnnouncementUserModel> {
    constructor() {
        super(AnnouncementUserDto, AnnouncementUserModel, {
            fromDto: AnnouncementUserModel.fromDto,
            toDto: AnnouncementUserModel.toDto,
        });


    }

}
export  default AnnouncementUserRepository;
