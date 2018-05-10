import * as momentTz from "moment-timezone";
import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, ExceptionModel, WhatOnModel, WhatOnImageModel, WhatOnViewModel} from "../models";
import {
    WhatOnRepository, CondoRepository, WhatOnImageRepository, WhatOnViewRepository,
} from "../data";
import {ErrorCode, HttpStatus, Logger} from "../libs/index";
import Redis from "../data/redis/redis";
import {PushNotificationService, UserUnitService} from "./index";


export class WhatOnService extends BaseService<WhatOnModel, typeof WhatOnRepository> {
    constructor() {
        super(WhatOnRepository);
    }

    public create(whatOn: WhatOnModel, related = [], filters = []): Promise<WhatOnModel> {
        if (whatOn != null) {
            return CondoRepository.findOne(whatOn.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return WhatOnRepository.insert(whatOn);
                })
                .then((object) => {
                    // insert image
                    return Promise.each(whatOn.images, (image, index) => {
                        return Promise.resolve()
                            .then(() => {
                                let whatOnImage = new WhatOnImageModel();
                                whatOnImage.whatOnId = object.id;
                                whatOnImage.imageURL = image;
                                whatOnImage.orderIndex = index;
                                return WhatOnImageRepository.insert(whatOnImage);
                            });
                    })
                        .then(() => {
                            return WhatOnRepository.findOne(object.id, related, filters);
                        })
                        .then(object => {
                            UserUnitService.findByCondoId(object.condoId)
                                .then(data => {
                                    if (data && data.length > 0) {
                                        let userIds = [];
                                        data.forEach(item => {
                                            userIds.push(item.userId);
                                        });

                                        // send push notification when user post new what on
                                        if (userIds.length > 0) {
                                            PushNotificationService.sendPostWhatOn(userIds, object);
                                        }
                                    }
                                })
                                .catch(error => {
                                    Logger.error(error.message, error);
                                });

                            return object;
                        });
                });
        }
        return Promise.resolve(null);
    }

    public update(whatOn: WhatOnModel, related = [], filters = []): Promise<WhatOnModel> {
        if (whatOn != null) {
            return CondoRepository.findOne(whatOn.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return WhatOnRepository.update(whatOn);
                })
                .then((object) => {
                    return WhatOnImageRepository.deleteByWhatOnId(whatOn.id);
                })
                .then((object) => {
                    // insert image
                    return Promise.each(whatOn.images, (image, index) => {
                        return Promise.resolve()
                            .then(() => {
                                let whatOnImage = new WhatOnImageModel();
                                whatOnImage.whatOnId = whatOn.id;
                                whatOnImage.imageURL = image;
                                whatOnImage.orderIndex = index;
                                return WhatOnImageRepository.insert(whatOnImage);
                            });
                    })
                        .then(() => {
                            return WhatOnRepository.findOne(whatOn.id, related, filters);
                        });
                })
                .catch(error => {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                });
        }
        return Promise.resolve(null);
    }

    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        return WhatOnRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<WhatOnModel>> {
        return WhatOnRepository.search(searchParams, offset, limit, related, filters)
        .then(result => {
            let objects: WhatOnModel[] = result.data;
            let multi = Redis.getClient().multi();

            objects.forEach(item => {
                let key = Redis.getWhatOnCountKey(item.id);
                multi.scard(key);
                multi.sismember(key, searchParams.userId);
            });
            return multi.execAsync()
            .then((object: number[]) => {
                if (object != null && object.length === result.data.length * 2) {
                    for (let i = 0; i < result.data.length; i++) {
                        result.data[i].readingCount = object[i * 2];
                        result.data[i].isRead = !!object[i * 2 + 1];
                    }
                }
                return result;
            });
        });
    }

    public archive(id: string, related = [], filters = []): Promise<any> {
        let whaton = new WhatOnModel();
        whaton.id = id;
        whaton.expiryDate = momentTz();
        return WhatOnRepository.update(whaton);
    }

    public read(id: string, userId: string, related = [], filters = []): Promise<any> {
        let key = Redis.getWhatOnCountKey(id);
        return WhatOnRepository.findOne(id)
            .then(object => {
                if (object === null || object.isDeleted === true) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.WHAT_ON_INVALID.CODE,
                        ErrorCode.RESOURCE.WHAT_ON_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                return Redis.getClient().sismemberAsync(key, userId)
                    .catch(err => {
                        Logger.error(err.message, err);
                        return 0; // error will return 0
                    });
            })
            .then(object => {
                if (object === 0) {
                    let whatOnView = new WhatOnViewModel();
                    whatOnView.whatOnId = id;
                    whatOnView.userId = userId;
                    return WhatOnViewRepository.insert(whatOnView)
                        .then(() => {
                            return Redis.getClient().saddAsync(key, userId)
                                .then((object) => {
                                    console.log(object);
                                });
                        });
                }
            });
    }
}

export default WhatOnService;
