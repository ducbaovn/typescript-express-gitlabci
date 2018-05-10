/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {UserSettingDto} from "./sql/models";
import {UserSettingModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class BanUserRepository extends BaseRepository<UserSettingDto, UserSettingModel> {
    constructor() {
        super(UserSettingDto, UserSettingModel, {
            fromDto: UserSettingModel.fromDto,
            toDto: UserSettingModel.toDto,
        });
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Promise<UserSettingModel>}
     */
    public findById(id: string, related = [], filters = []): Promise<UserSettingModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.ID, id);
        }, related, filters);
    }

    /**
     *
     * @param userId
     * @param related
     * @param filters
     * @returns {Promise<UserSettingModel>}
     */
    public findByUserId(userId: string, related = [], filters = []): Promise<UserSettingModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, related, filters);
    }


}
export  default BanUserRepository;
