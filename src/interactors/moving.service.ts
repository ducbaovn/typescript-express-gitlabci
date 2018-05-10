/**
 * Created by davidho on 2/14/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, MovingModel, ExceptionModel} from "../models";
import {MovingRepository} from "../data";
import {STATUS_MOVING} from "../libs/constants";
import {ErrorCode, HttpStatus} from "../libs";
import * as Schema from "../data/sql/schema";

export class MovingService extends BaseService<MovingModel, typeof MovingRepository> {
    constructor() {
        super(MovingRepository);
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<MovingModel>>}
     */
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<MovingModel>> {
        return MovingRepository.search(searchParams, offset, limit, related, filters);
    }

    public archive(id): Promise<string> {
        if (!id) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let moving = new MovingModel();
        moving.id = id;
        moving.status = STATUS_MOVING.ARCHIVED;

        return MovingRepository.update(moving)
        .then(movingDto => {
            return id;
        });
    }

    public archiveExpired(): Promise<boolean> {
        let updateStatus = {};
        updateStatus[Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS] = STATUS_MOVING.ARCHIVED;

        return MovingRepository.updateByQuery(q => {
            q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE, "<", new Date());
        }, updateStatus)
        .then(movingDto => {
            return true;
        });
    }
}

export default MovingService;
