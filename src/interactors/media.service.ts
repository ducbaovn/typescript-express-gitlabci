import {BaseService} from "./base.service";
import {MediaModel} from "../models/media.model";
import {MediaRepository} from "../data";
import {CollectionWrap} from "../models/collections";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import has = Reflect.has;
/**
 * Created by kiettv on 1/17/17.
 */
export class MediaService extends BaseService<MediaModel, typeof MediaRepository> {
    constructor() {
        super(MediaRepository);
    }

    findByHash(hash: string): Promise<CollectionWrap<MediaModel>> {
        let ret = new CollectionWrap<MediaModel>();
        if (hash == null || hash === "") {
            Promise.resolve(ret);
        }
        return Promise.resolve()
            .then(() => {
                return MediaRepository.findByQuery(q => {
                    q.where(Schema.MEDIA_TABLE_SCHEMA.FIELDS.HASH, hash);
                });
            })
            .then((objects) => {
                ret.total = objects.length;
                ret.data = objects;
                return ret;
            });
    }
}

export default MediaService;
