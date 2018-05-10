/**
 * Created by ducbaovn on 28/04/17.
 */

import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { RatingAdvertisingTemplateModel, CollectionWrap } from "../models";
import {RatingAdvertisingTemplateRepository} from "../data";
import * as Schema from "../data/sql/schema";
import { ErrorCode, HttpStatus } from "../libs/index";
import { DELETE_STATUS, ENABLE_STATUS } from "../libs/constants";
import {ExceptionModel} from "../models/exception.model";
import * as _ from "lodash";


export class RatingAdvertisingTemplateService extends BaseService<RatingAdvertisingTemplateModel, typeof RatingAdvertisingTemplateRepository> {
    constructor() {
        super(RatingAdvertisingTemplateRepository);
    }

    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<RatingAdvertisingTemplateModel>> {
        let query = (offset?: number, limit?: number, isOrderBy?: Boolean) => {
            return (q): void => {
                q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                if (params.key) {
                    q.where(Schema.SELL_MY_CAR_SCHEMA.FIELDS.EMAIL, "ILIKE", `%${params.key}%`);
                    q.orWhere(Schema.SELL_MY_CAR_SCHEMA.FIELDS.DESCRIPTION, "ILIKE", `%${params.key}%`);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (isOrderBy != null) {
                    q.orderBy(Schema.SELL_MY_CAR_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                }
            };
        };
        return RatingAdvertisingTemplateRepository.countAndQuery(query(), query(offset, limit, true), related, filters);
    }

    /**
     * @param RatingTemplateModel
     * @param related
     * @param filters
     * @returns {any}
     */
    public rating(ratingTemplateModel: RatingAdvertisingTemplateModel, related = [], filters = []): Promise<RatingAdvertisingTemplateModel> {
        if (ratingTemplateModel != null) {
            return Promise.resolve()
                .then(() => {
                    // invalid userId, templateId (constrained in migration)
                    // invalid rating value
                    if (ratingTemplateModel.ratingValue < 1 || ratingTemplateModel.ratingValue > 5 || (ratingTemplateModel.ratingValue % 1) !== 0) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.RATING_TEMPLATE_INVALID_DATA.CODE,
                            ErrorCode.RESOURCE.RATING_TEMPLATE_INVALID_DATA.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    // user rated a template already
                    return RatingAdvertisingTemplateRepository.findOneByQuery(q => {
                        q.where(Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID, ratingTemplateModel.userId);
                        q.where(Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID, ratingTemplateModel.templateId);
                    })
                        .then((user) => {
                            if (user != null) {
                                throw new ExceptionModel(
                                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                                    false,
                                    HttpStatus.BAD_REQUEST,
                                );
                            }
                        });
                })
                .then(() => {
                    return RatingAdvertisingTemplateRepository.insert(ratingTemplateModel);
                })
                .then((object) => {
                    return RatingAdvertisingTemplateRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }
}

export default RatingAdvertisingTemplateService;