/**
 * Created by davidho on 4/17/17.
 */

import {BaseRepository} from "./base.repository";
import {FeedCommentDto} from "./sql/models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";
import {FeedCommentModel} from "../models";
import {CollectionWrap} from "../models/collections";
import Redis from "../data/redis/redis";

export class FeedCommentRepository extends BaseRepository<FeedCommentDto, FeedCommentModel> {
    constructor() {
        super(FeedCommentDto, FeedCommentModel, {
            fromDto: FeedCommentModel.fromDto,
            toDto: FeedCommentModel.toDto,
        });
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {PromiseLike<T>}
     */
    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<FeedCommentModel>> {
        let keyword = searchParams.key || null;
        let feedId = searchParams.feedId || null;
        let userId = searchParams.userId || null;
        let type = searchParams.type || null;

        limit = limit || null;
        offset = offset || null;

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                q.where(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.andWhere(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);

                if (keyword != null) {
                    q.andWhere(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.CONTENT, "ILIKE", `%${keyword}%`);
                }

                if (feedId != null) {
                    q.andWhere(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID, feedId);
                }

                if (offset != null) {
                    q.offset(offset);
                }

                if (limit != null) {
                    q.limit(limit);
                }

                if (isOrder != null) {
                    q.orderBy(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE, "ASC");
                }
            };
        };

        let ret = new CollectionWrap<FeedCommentModel>();

        return this.countByQuery(query())
            .then((total) => {
                ret.total = total;

                return this.findByQuery(query(offset, limit, true), related, filters);
            })
            .then((objects) => {
                let multi = Redis.getClient().multi();

                objects.forEach((item, index) => {
                    let key = Redis.getFeedCommentLikeKey(item.type, item.feedId, item.id);

                    multi.scard(key);
                    multi.sismember(key, userId);
                });

                ret.data = objects;

                return multi.execAsync();
            })
            .then((object: number[]) => {
                if (object != null && object.length === ret.data.length * 2) {
                    for (let i = 0; i < ret.data.length; i++) {
                        ret.data[i].numberOfLike = object[i * 2];
                        ret.data[i].isLike = !!object[i * 2 + 1];
                    }
                }

                return ret;
            });
    }
    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public findById(id: string, related = [], filters = []): Promise<FeedCommentModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.ID, id);
        }, related, filters);
    }

    /**
     *
     * @param feedId
     * @param related
     * @param filters
     * @returns {Promise<FeedCommentModel>}
     */
    public findByFeedId(feedId: string, related = [], filters = []): Promise<FeedCommentModel[]> {
        return this.findByQuery(q => {
            q.where(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID, feedId);
        }, related, filters);
    }


}
export  default FeedCommentRepository;
