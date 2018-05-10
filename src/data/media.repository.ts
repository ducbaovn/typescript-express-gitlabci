import {BaseRepository} from "./base.repository";
import {MediaModel} from "../models";
import {MediaDto} from "./sql/models";
/**
 * Created by kiettv on 1/17/17.
 */
export class MediaRepository extends BaseRepository<MediaDto, MediaModel> {
    constructor() {
        super(MediaDto, MediaModel, {
            fromDto: MediaModel.fromDto,
            toDto: MediaModel.toDto,
        });
    }
}
export  default MediaRepository;
