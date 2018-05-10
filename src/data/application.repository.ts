/**
 * Created by ducbaovn on 06/06/17.
 */

import {BaseRepository} from "./base.repository";
import {ApplicationDto} from "./sql/models";
import { ApplicationModel } from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";

export class ApplicationRepository extends BaseRepository<ApplicationDto, ApplicationModel> {
    constructor() {
        super(ApplicationDto, ApplicationModel, {
            fromDto: ApplicationModel.fromDto,
            toDto: ApplicationModel.toDto,
        });
    }
}

export default ApplicationRepository;
