/**
 * Created by davidho on 4/11/17.
 */

import {BaseRepository} from "./base.repository";
import {WhatOnViewDto} from "./sql/models";
import {WhatOnViewModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class WhatOnViewRepository extends BaseRepository<WhatOnViewDto, WhatOnViewModel> {
    constructor() {
        super(WhatOnViewDto, WhatOnViewModel, {
            fromDto: WhatOnViewModel.fromDto,
            toDto: WhatOnViewModel.toDto,
        });
    }

}
export  default WhatOnViewRepository;
