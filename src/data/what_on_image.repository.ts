/**
 * Created by davidho on 2/13/17.
 */

import {BaseRepository} from "./base.repository";
import {WhatOnImageDto} from "./sql/models";
import {WhatOnImageModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class WhatOnImageRepository extends BaseRepository<WhatOnImageDto, WhatOnImageModel> {
    constructor() {
        super(WhatOnImageDto, WhatOnImageModel, {
            fromDto: WhatOnImageModel.fromDto,
            toDto: WhatOnImageModel.toDto,
        });
    }

    public deleteByWhatOnId(whatOnId: string, related = [], filters = []): Promise<any[]> {
        return this.deleteByQuery(q => {
            q.where(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.WHAT_ON_ID, whatOnId);
        });
    }

}
export  default WhatOnImageRepository;
