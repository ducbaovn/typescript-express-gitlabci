/**
 * Created by davidho on 4/13/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import * as firebase from "firebase-admin";
import Redis from "../data/redis/redis";
import {BAN_USER_TYPE, DELETE_STATUS, ENABLE_STATUS, FEED_TYPE, CLUSTERING_TYPE, INBOX_TYPE} from "../libs/constants";
import {BaseService} from "./base.service";
import {CollectionWrap, GarageSaleModel, ExceptionModel, GarageSaleCategoryModel} from "../models";
import {ErrorCode, HttpStatus, Logger, FirebaseAdmin} from "../libs";
import {GarageSaleDto} from "../data/sql/models";
import {GarageSaleRepository, GarageSaleCategoryRepository, UserRepository, BanUserRepository} from "../data";
import {PushNotificationService, UserUnitService, ClusteringService} from "./index";

export class GarageSaleService extends BaseService<GarageSaleModel, typeof GarageSaleRepository> {
    constructor() {
        super(GarageSaleRepository);
    }

    /**
     * get list category by garage sale
     * @param related
     * @param filters
     */
    public listGarageSaleCategory(related = [], filters = []): Promise<CollectionWrap<GarageSaleCategoryModel>> {
        let ret: CollectionWrap<GarageSaleCategoryModel> = new CollectionWrap<GarageSaleCategoryModel>();
        return GarageSaleCategoryRepository.findByQuery(q => {
            q.where(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        }, related, filters)
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }

    public create(garageSale: GarageSaleModel, related = [], filters = []): Promise<GarageSaleModel> {
        if (garageSale != null) {
            return GarageSaleCategoryRepository.findOne(garageSale.categoryId)
                .then(category => {
                    if (category === null || category.isEnable === false || category.isDeleted === true) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.CODE,
                            ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return UserRepository.findOne(garageSale.userId);
                })
                .then(user => {
                    if (user === null || user.isEnable === false || user.isDeleted === true) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.USER_INVALID.CODE,
                            ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    garageSale.user = user;
                    return BanUserRepository.findBanUserByTypeAndUserId(BAN_USER_TYPE.GARAGE_SALE, garageSale.userId);
                })
                .then((object) => {
                    if (object != null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ACCOUNT_IS_BANNED.CODE,
                            ErrorCode.RESOURCE.ACCOUNT_IS_BANNED.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }

                    return GarageSaleRepository.insertGet(garageSale);
                })
                .tap((object: GarageSaleModel) => {
                    object.user = garageSale.user;

                    UserUnitService.findByCondoId(object.condoId)
                        .then(data => {
                            if (data && data.length > 0) {
                                let userIds = [];

                                data.forEach(item => {
                                    if (userIds.indexOf(item.userId) === -1 && item.userId !== garageSale.userId) {
                                        userIds.push(item.userId);
                                    }
                                });

                                // send push notification new garage sale post
                                if (userIds.length > 0) {
                                    return PushNotificationService.sendPostFeed(userIds, FEED_TYPE.GARAGE_SALE, object);
                                }
                            }
                        })
                        .catch(error => {
                            Logger.error(error.message, error);
                        });
                })
                .tap((item: GarageSaleModel) => {
                    let fb = FirebaseAdmin.getInstance();
                    if (fb != null) {
                        Promise.resolve(fb.database().ref("items").child(item.id).set({
                            id: item.id,
                            title: item.title,
                            desc: item.content,
                            imageUrl: item.images != null ? item.images[0] : "",
                            type: item.type,
                            price: item.price,
                            createdDate: item.createdDate.valueOf(),
                            updatedDate: firebase.database.ServerValue.TIMESTAMP,
                            categoryName: ""
                        })).catch(err => Logger.error(err.message, err));
                    }
                });

        }
        return Promise.resolve(null);
    }

    public update(garageSale: GarageSaleModel, related = [], filters = []): Promise<GarageSaleDto> {
        if (garageSale != null) {
            return GarageSaleCategoryRepository.findOne(garageSale.categoryId)
                .then(category => {
                    if (category === null || category.isEnable === false || category.isDeleted === true) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.CODE,
                            ErrorCode.RESOURCE.FEEDBACK_CATEGORY_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return UserRepository.findOne(garageSale.userId);
                })
                .then(user => {
                    if (user === null || user.isEnable === false || user.isDeleted === true) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.USER_INVALID.CODE,
                            ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return GarageSaleRepository.update(garageSale);
                });

        }
        return Promise.resolve(null);
    }

    public suspend(garageSale: GarageSaleModel, related = [], filters = []): Promise<GarageSaleDto> {
        if (garageSale != null) {
            return this.getDetailById(garageSale.id)
                .then(object => {
                    return GarageSaleRepository.update(garageSale);
                });

        }
        return Promise.resolve(null);
    }

    // search(get list) garage sale
    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<GarageSaleModel>> {
        return UserRepository.findOne(searchParams.userId, ["condo"])
            .then(user => {
                if (user.condo != null) {
                    searchParams.condoId = user.condo.id;
                    return ClusteringService.listClusteringCondo(searchParams.condoId, CLUSTERING_TYPE.GARAGE_SALE);
                }
                return [];
            })
            .then(condoArr => {
                searchParams.condoArr = condoArr;
                return GarageSaleRepository.search(searchParams, offset, limit, related, filters);
            });
    }

    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        return GarageSaleRepository.deleteLogic(id)
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
     * @param userId
     * @returns {Promise<GarageSaleModel>}
     */
    public getDetailById(id: string, related = [], filters = [], userId?: string) {
        return GarageSaleRepository.findById(id, related, filters, userId)
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
}

export default GarageSaleService;
