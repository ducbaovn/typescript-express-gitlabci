/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {AnnouncementViewDto} from "./sql/models";
import {AnnouncementViewModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class AnnouncementViewRepository extends BaseRepository<AnnouncementViewDto, AnnouncementViewModel> {
    constructor() {
        super(AnnouncementViewDto, AnnouncementViewModel, {
            fromDto: AnnouncementViewModel.fromDto,
            toDto: AnnouncementViewModel.toDto,
        });


    }

}
export  default AnnouncementViewRepository;
