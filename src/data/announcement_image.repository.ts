/**
 * Created by davidho on 2/13/17.
 */

import {BaseRepository} from "./base.repository";
import {AnnouncementImageDto} from "./sql/models";
import {AnnouncementImageModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class AnnouncementImageRepository extends BaseRepository<AnnouncementImageDto, AnnouncementImageModel> {
    constructor() {
        super(AnnouncementImageDto, AnnouncementImageModel, {
            fromDto: AnnouncementImageModel.fromDto,
            toDto: AnnouncementImageModel.toDto,
        });
    }

    /**
     * delete announcement by Id
     * @param AnnouncementId
     * @param related
     * @param filters
     * @returns {Promise<any[]>}
     */
    public deleteByAnnouncementId(AnnouncementId: string, related = [], filters = []): Promise<any[]> {
        return this.deleteByQuery(q => {
            q.where(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID, AnnouncementId);
        });
    }
}
export  default AnnouncementImageRepository;
