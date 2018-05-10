import * as Promise from "bluebird";
import * as firebase from "firebase-admin";
import * as Schema from "../data/sql/schema";
import Redis from "../data/redis/redis";
import BaseService from "./base.service";
import {
    CollectionWrap,
    CondoModel,
    ExceptionModel,
    FeedCommentLikeModel,
    FeedCommentModel,
    FeedLikeModel,
    FeedModel,
    AdvertisingCondoModel,
    UserModel
} from "../models";
import {
    FeedRepository, FeedLikeRepository, FeedCommentRepository,
    FeedCommentLikeRepository, AdvertisingCondoRepository, GarageSaleRepository, UserRepository, BanUserRepository,
} from "../data";
import { ErrorCode, HttpStatus, Logger, FirebaseAdmin } from "../libs";
import { FEED_TYPE, ROLE, CLUSTERING_TYPE, INBOX_TYPE, ADVERTISING_TEMPLATE_TYPE } from "../libs/constants";
import { PushNotificationService, UserUnitService, ClusteringService } from "./";

export class FeedService extends BaseService<FeedModel, typeof FeedRepository> {
    constructor() {
        super(FeedRepository);
    }

    /**
     *
     * @param feed
     * @param related
     * @param filters
     * @returns {any}
     */
    public create(feed: FeedModel, related = [], filters = []): Promise<FeedModel> {
        if (feed != null) {
            return BanUserRepository.findBanUserByTypeAndUserId(feed.type, feed.userId)
                .then((object) => {
                    if (object != null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ACCOUNT_IS_BANNED.CODE,
                            ErrorCode.RESOURCE.ACCOUNT_IS_BANNED.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return FeedRepository.insertGet(feed, ["user"]);
                })
                .tap(object => {
                    let key = Redis.getFeedPostKey(feed.type, object.id);
                    let multi = Redis.getClient().multi();

                    feed.tag.forEach(tag => {
                        multi.sadd(key, tag);
                    });

                    multi.execAsync();

                    UserUnitService.findByCondoId(object.condoId)
                        .then(data => {
                            if (data && data.length > 0) {
                                let userIds = [];

                                data.forEach(item => {
                                    if (userIds.indexOf(item.userId) === -1 && item.userId !== feed.userId) {
                                        userIds.push(item.userId);
                                    }
                                });

                                // send push notification new feed post
                                if (userIds.length > 0) {
                                    return PushNotificationService.sendPostFeed(userIds, feed.type, object);
                                }
                            }
                        })
                        .catch(error => {
                            Logger.error(error.message, error);
                        });
                })
                .tap((item: FeedModel) => {
                    if (item.type === FEED_TYPE.FIND_A_BUDDY) {
                        let fb = FirebaseAdmin.getInstance();

                        if (fb != null) {
                            Promise.resolve(fb.database().ref("items").child(item.id).set({
                                id: item.id,
                                title: item.title,
                                desc: item.content,
                                imageUrl: item.imageUrl != null ? item.imageUrl : "",
                                type: item.type,
                                createdDate: item.createdDate.valueOf(),
                                updatedDate: firebase.database.ServerValue.TIMESTAMP,
                                categoryName: ""
                            })).catch(err => Logger.error(err.message, err));
                        }
                    }
                });
        }

        return Promise.resolve(null);
    }

    /**
     *
     * @param feed
     * @param related
     * @param filters
     * @returns {any}
     */
    public update(feed: FeedModel, related = [], filters = []): Promise<FeedModel> {
        if (feed != null) {
            return this.findFeedById(feed.id)
                .then(() => {
                    return FeedRepository.update(feed);
                })
                .then(() => {
                    return FeedRepository.findOne(feed.id);
                })
                .tap((item: FeedModel) => {
                    if (item.type === FEED_TYPE.FIND_A_BUDDY) {
                        let fb = FirebaseAdmin.getInstance();

                        if (fb != null) {
                            Promise.resolve(fb.database().ref("items").child(item.id).set({
                                id: item.id,
                                title: item.title,
                                desc: item.content,
                                imageUrl: item.imageUrl != null ? item.imageUrl : "",
                                type: item.type,
                                createdDate: item.createdDate.valueOf(),
                                updatedDate: firebase.database.ServerValue.TIMESTAMP,
                                categoryName: ""
                            })).catch(err => Logger.error(err.message, err));
                        }
                    }
                });

        }

        return Promise.resolve(null);
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<FeedModel>>}
     */
    public search(params: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<FeedModel>> {
        return Promise.resolve()
        .then(() => {
            if (!params.userId || !params.roleId) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if (params.roleId !== ROLE.SYSTEM_ADMIN && params.type !== FEED_TYPE.SPONSOR_ADS) {
                switch (params.type) {
                    case CLUSTERING_TYPE.CHATTER_BOX:
                    case CLUSTERING_TYPE.FIND_A_BUDDY:
                    case CLUSTERING_TYPE.GARAGE_SALE:
                        break;
                    default:
                        params.type = CLUSTERING_TYPE.ALL;
                }
                return UserRepository.findOne(params.userId, ["condo"])
                .then(user => {
                    if (user.condo != null) {
                        params.condoId = user.condo.id;
                        return ClusteringService.listClusteringCondo(user.condo.id, params.type);
                    }
                    return [];
                })
                .then(condoArr => {
                    params.condoArr = condoArr;
                });
            }
        })
        .then(() => {
            return FeedRepository.search(params, offset, limit, related, filters);
        })
        .tap(wrapper => {
            return Promise.each(wrapper.data, (feed => {
                return this.getCounterLikeCommentIsLike(feed, params.userId);
            }));
        })
        .tap(wrapper => {
            if (params.roleId !== ROLE.SYSTEM_ADMIN && params.type === FEED_TYPE.CHATTER_BOX) {
                let query = {
                    condoId: params.condoId,
                    templateType: ADVERTISING_TEMPLATE_TYPE.SPONSOR_AD_TEMPLATE
                };
                let sponsorList: AdvertisingCondoModel[];
                return AdvertisingCondoRepository.getAllTemplateByCondo(query, null, null, ["advertiser", "advertisingTemplate.pictures", "condo"])
                    .then(objects => {
                        sponsorList = objects.data;
                        return this.insertSponsorAdsToChatterboxList(params.userId, sponsorList, wrapper.data, offset);
                    })
                    .then(result => {
                        wrapper.data = result;
                    });
            }
        });
    }

    private insertSponsorAdsToChatterboxList(userId: string, sponsorList: AdvertisingCondoModel[], chatterboxList: FeedModel[], chatterboxListOffset: number = 0): Promise<FeedModel[]> {
        if (sponsorList.length < 1) {
            return Promise.resolve(chatterboxList);
        }
        let sponsorMap = new Map<number, FeedModel>();
        let multi = Redis.getClient().multi();
        sponsorList.forEach(item => {
            let likeKey = Redis.getFeedLikeKey(FEED_TYPE.SPONSOR_ADS, item.id);
            let commentKey = Redis.getFeedCommentKey(FEED_TYPE.SPONSOR_ADS, item.id);
            let counterKey = Redis.getFeedCommentCounterKey(FEED_TYPE.SPONSOR_ADS, item.id);
            multi.scard(likeKey);
            multi.sismember(likeKey, userId);
            multi.get(counterKey);
            multi.sismember(commentKey, userId);
        });
        let result = [];
        return multi.execAsync()
        .then(object => {
            let insertIndex = 0;
            let totalFrequency = 0;
            sponsorList.forEach((item, i) => {
                let sponsorFeed = FeedModel.fromSponsorAd(item);
                sponsorFeed.numberOfLike = isNaN(Number.parseInt(object[i * 4])) ? 0 : Number.parseInt(object[i * 4]);
                sponsorFeed.isLike = !!object[i * 4 + 1];
                sponsorFeed.numberOfComment = isNaN(Number.parseInt(object[i * 4 + 2])) ? 0 : Number.parseInt(object[i * 4 + 2]);
                sponsorFeed.isComment = !!object[i * 4 + 3];
                insertIndex += item.frequency;
                sponsorMap.set(insertIndex, sponsorFeed);
            });
            totalFrequency = insertIndex;
            chatterboxList.forEach((chatItem, i) => {
                result.push(chatItem);
                let realIndex = i + chatterboxListOffset + 1;
                let mapKey = (realIndex % totalFrequency) === 0 ? totalFrequency : (realIndex % totalFrequency);
                if (sponsorMap.get(mapKey)) {
                    result.push(sponsorMap.get(mapKey));
                }
            });
            return result;
        });
    }

    /**
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {any}
     */
    public searchComment(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<FeedCommentModel>> {
        let feedId = searchParams.feedId || null;
        return FeedCommentRepository.search(searchParams, offset, limit, related, filters);
    }

    /**
     *
     * @param likeModel
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public like(likeModel: FeedLikeModel, related = [], filters = []): Promise<any> {
        let key = Redis.getFeedLikeKey(likeModel.type, likeModel.feedId);
        let feedLikeByUserKey = Redis.getFeedLikeByUserKey(likeModel.type, likeModel.feedId, likeModel.userId);
        let feedInfo: any;
        let userLike: UserModel;
        let allowPush: boolean = true;

        return Promise.resolve()
            .then(() => {
                if (likeModel.type === FEED_TYPE.SPONSOR_ADS) {
                    return AdvertisingCondoRepository.findOne(likeModel.feedId);
                }

                if (likeModel.type === FEED_TYPE.GARAGE_SALE) {
                    return this.findGarageSaleById(likeModel.feedId, ["user"]);
                }

                return this.findFeedById(likeModel.feedId, ["user"]);
            })
            .then((object) => {
                feedInfo = object;

                return FeedLikeRepository.countByQuery(q => {
                    q.where(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID, likeModel.feedId);
                    q.andWhere(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.USER_ID, likeModel.userId);
                });
            })
            .then(object => {
                if (object === 0) { // if user doesn't like
                    if (likeModel.isLike === true) {
                        return FeedLikeRepository.insertGet(likeModel, ["user"])
                            .then((likeObj) => {
                                if (likeObj != null && likeObj.user != null) {
                                    userLike = likeObj.user;
                                }

                                Redis.getClient().saddAsync(key, likeModel.userId);

                                // Check the someone like the topic, and only 1 message to user.
                                return Redis.getClient().getAsync(feedLikeByUserKey);
                            })
                            .then((valueRd) => {
                                if (!valueRd) {
                                    // When someone LOVES the Topic you CREATED, you get notification
                                    if (feedInfo.userId !== likeModel.userId) {
                                        // Store the someone like the topic.
                                        Redis.getClient().setAsync(feedLikeByUserKey, true);

                                        PushNotificationService.sendLikeFeed([feedInfo.userId], likeModel.type, feedInfo, userLike);
                                    }
                                }
                            })
                            .catch(error => {
                                Logger.error(error.message, error);
                            });
                    }

                    return false;
                } else { // if user has liked
                    if (likeModel.isLike === false) {
                        return FeedLikeRepository.deleteByQuery(q => {
                            q.where(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID, likeModel.feedId);
                            q.andWhere(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.USER_ID, likeModel.userId);
                        })
                            .then(() => {
                                return Redis.getClient().sremAsync(key, likeModel.userId);
                            });
                    }

                    return false;

                }
            });
    }

    /**
     *
     * @param commentModel
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public comment(commentModel: FeedCommentModel, related = [], filters = []): Promise<any> {
        let key = Redis.getFeedCommentKey(commentModel.type, commentModel.feedId);
        let counterKey = Redis.getFeedCommentCounterKey(commentModel.type, commentModel.feedId);
        let feedInfo: any;
        let commentInfo: FeedCommentModel;

        return Promise.resolve()
            .then(() => {
                if (commentModel.type === FEED_TYPE.SPONSOR_ADS) {
                    return AdvertisingCondoRepository.findOne(commentModel.feedId);
                }

                if (commentModel.type === FEED_TYPE.GARAGE_SALE) {
                    return this.findGarageSaleById(commentModel.feedId, ["user"]);
                }

                return this.findFeedById(commentModel.feedId, ["user"]);
            })
            .then((object) => {
                feedInfo = object;
                return FeedCommentRepository.insertGet(commentModel, related);
            })
            .then((object) => {
                commentInfo = object;
                commentInfo.numberOfLike = 0;
                commentInfo.isLike = false;
                return Redis.getClient().saddAsync(key, commentModel.userId);
            })
            .then(() => {
                return Redis.getClient().incrAsync(counterKey);
            })
            .then(() => {
                // OTHER users COMMENT on the Topic that you CREATED
                // send push notification when user comment on your post
                if (feedInfo.userId !== commentModel.userId) {
                    PushNotificationService.sendCommentFeed([feedInfo.userId], feedInfo, commentInfo.user);
                }

                return FeedCommentRepository.findByFeedId(feedInfo.id);
            })
            .then(data => {
                if (data && data.length > 0) {
                    let userIds = [];

                    data.forEach(item => {
                        // OTHER users COMMENT on the Topic you PARTICIPATED (not created)
                        if (item.userId !== commentModel.userId && feedInfo.userId !== item.userId && userIds.indexOf(item.userId) === -1) {
                            userIds.push(item.userId);
                        }
                    });

                    if (userIds && userIds.length > 0) {
                        // send push notification
                        PushNotificationService.sendOtherUserCommentOnYourCommentFeed(userIds, feedInfo, commentInfo.user);
                    }
                }
                return commentInfo;
            });
    }

    public updateComment(comment: FeedCommentModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                return FeedCommentRepository.update(comment);
            });
    }

    /**
     * Delete comment
     * @param commentModel
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public deleteComment(comment: FeedCommentModel): Promise<any> {
        let key: string;
        let counterKey: string;
        return Promise.resolve()
            .then(() => {
                if (comment != null) {
                    key = Redis.getFeedCommentKey(comment.type, comment.feedId);
                    counterKey = Redis.getFeedCommentCounterKey(comment.type, comment.feedId);
                    return FeedCommentRepository.deleteLogic(comment.id);
                }
            })
            .then(() => {
                if (key) {
                    return Redis.getClient().sremAsync(key, comment.userId);
                }
            })
            .then(() => {
                if (counterKey) {
                    return Redis.getClient().decrAsync(counterKey);
                }
            });
    }

    /**
     *
     * @param likeModel
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public likeComment(likeModel: FeedCommentLikeModel, related = [], filters = []): Promise<any> {
        let key = "";
        let commentLikeByUserKey = Redis.getFeedLikeByUserKey(likeModel.type, likeModel.commentId, likeModel.userId);
        let commentInfo: FeedCommentModel;
        let userLike: UserModel;

        return FeedCommentRepository.findOne(likeModel.commentId)
            .then(object => {
                commentInfo = object;
                key = Redis.getFeedCommentLikeKey(likeModel.type, object.feedId, likeModel.commentId);

                return FeedCommentLikeRepository.countByQuery(q => {
                    q.where(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.FEED_COMMENT_ID, likeModel.commentId);
                    q.andWhere(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.USER_ID, likeModel.userId);
                });
            })
            .then(object => {
                if (object === 0) { // if user doesn't like
                    if (likeModel.isLike === true) {
                        return FeedCommentLikeRepository.insertGet(likeModel, ["user"])
                            .then((likeObj) => {
                                if (likeObj != null && likeObj.user != null) {
                                    userLike = likeObj.user;
                                }

                                Redis.getClient().saddAsync(key, likeModel.userId);

                                // Check the someone like the topic, and only 1 message to user.
                                return Redis.getClient().getAsync(commentLikeByUserKey);
                            })
                            .then((valueRD) => {
                                // When someone LOVES your COMMENTS, you get notification
                                if (!valueRD) {
                                    if (commentInfo.userId !== likeModel.userId) {
                                        // Store the someone like the comment on topic.
                                        Redis.getClient().setAsync(commentLikeByUserKey, true);

                                        PushNotificationService.sendLikeCommentFeed(commentInfo.userId, commentInfo, userLike);
                                    }
                                }
                            })
                            .catch(error => {
                                Logger.error(error.message, error);
                            });
                    }

                    return false;
                } else { // if user has liked
                    if (likeModel.isLike === false) {
                        return FeedCommentLikeRepository.deleteByQuery(q => {
                            q.where(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.FEED_COMMENT_ID, likeModel.commentId);
                            q.andWhere(Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.USER_ID, likeModel.userId);
                        })
                            .then(() => {
                                return Redis.getClient().sremAsync(key, likeModel.userId);
                            });
                    }

                    return false;

                }
            });
    }

    /**
     *
     * @param id
     * @returns {Bluebird<boolean>}
     */
    public removeById(id: string): Promise<boolean> {
        return this.findFeedById(id)
            .then(object => {
                return FeedRepository.deleteLogic(object.id);
            })
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public findFeedById(id: string, related = [], filters = [], userId?: string): Promise<any> {
        return FeedRepository.findOne(id, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                if (userId) {
                    return this.getCounterLikeCommentIsLike(object, userId);
                }
                return object;
            });
    }

    public detailSponsorAd(id: string, userId: string): Promise<any> {
        let result: FeedModel;
        return AdvertisingCondoRepository.findOne(id, ["advertiser", "advertisingTemplate.pictures", "condo"])
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                return object;
            })
            .then((object) => {
                result = FeedModel.fromSponsorAd(object);
                return this.getCounterLikeCommentIsLike(result, userId);
            });
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */

    public findGarageSaleById(id: string, related = [], filters = []): Promise<any> {
        return GarageSaleRepository.findById(id, related, filters)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                return object;
            });
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public validateComment(id: string, userId?: string): Promise<FeedCommentModel> {
        return FeedCommentRepository.findById(id)
            .then(object => {
                if (object === null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.COMMENT_NOT_EXIST.CODE,
                        ErrorCode.RESOURCE.COMMENT_NOT_EXIST.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                if (userId != null && object.userId !== userId) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                }
                return object;
            });
    }

    public getCounterLikeCommentIsLike(feed: FeedModel, userId: string): Promise<FeedModel> {
        return Promise.resolve()
        .then(() => {
            if (!feed.id || !feed.type) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            let likeKey = Redis.getFeedLikeKey(feed.type, feed.id);
            let commentKey = Redis.getFeedCommentKey(feed.type, feed.id);
            let counterKey = Redis.getFeedCommentCounterKey(feed.type, feed.id);
            let multi = Redis.getClient().multi();
            multi.scard(likeKey);
            multi.sismember(likeKey, userId);
            multi.get(counterKey);
            multi.sismember(commentKey, userId);
            return multi.execAsync();
        })
        .then(object => {
            feed.numberOfLike = isNaN(Number.parseInt(object[0])) ? 0 : Number.parseInt(object[0]);
            feed.isLike = !!object[1];
            feed.numberOfComment = isNaN(Number.parseInt(object[2])) ? 0 : Number.parseInt(object[2]);
            feed.isComment = !!object[3];
            return feed;
        });
    }
}

export default FeedService;
