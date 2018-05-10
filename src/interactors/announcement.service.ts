/**
 * Created by davidho on 2/12/17.
 */

import * as Promise from "bluebird";
import * as momentTz from "moment-timezone";
import Redis from "../data/redis/redis";
import {BaseService} from "./base.service";
import {ExceptionModel, CollectionWrap, AnnouncementModel, AnnouncementUnitModel, AnnouncementImageModel, AnnouncementViewModel} from "../models";
import {
    AnnouncementRepository, CondoRepository, AnnouncementImageRepository,
    AnnouncementViewRepository, AnnouncementUnitRepository
} from "../data";
import {ErrorCode, HttpStatus, Logger} from "../libs";
import {PushNotificationService, UserUnitService} from "./";

export class AnnouncementService extends BaseService<AnnouncementModel, typeof AnnouncementRepository> {
    constructor() {
        super(AnnouncementRepository);
    }

    public create(announcement: AnnouncementModel, related = [], filters = []): Promise<AnnouncementModel> {
        if (announcement != null) {
            return CondoRepository.findOne(announcement.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return AnnouncementRepository.insert(announcement);
                })
                .then((object) => {
                    // insert image
                    return Promise.each(announcement.images, (image, index) => {
                        return Promise.resolve()
                            .then(() => {
                                let announcementImage = new AnnouncementImageModel();
                                announcementImage.announcementId = object.id;
                                announcementImage.imageURL = image;
                                announcementImage.orderIndex = index;
                                return AnnouncementImageRepository.insert(announcementImage);
                            });
                    })
                        .then(() => {
                            return AnnouncementRepository.findOne(object.id, related, filters);
                        })
                        .then(object => {
                            UserUnitService.findByCondoId(object.condoId)
                                .then(data => {
                                    if (data && data.length > 0) {
                                        let userIds = [];
                                        data.forEach(item => {
                                            if (userIds.indexOf(item.userId) === -1) {
                                                userIds.push(item.userId);
                                            }
                                        });

                                        // send push notification when user post new announcement
                                        if (userIds.length > 0) {
                                            PushNotificationService.sendPostAnnouncement(userIds, object);
                                        }
                                        return data;
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

    public createTargeted(announcement: AnnouncementModel,  isResidenceOwners: boolean, isResidenceTenants: boolean, isNonResidence: boolean, listUnitIds: string[], related = [], filters = []): Promise<AnnouncementModel> {
        if (announcement != null) {
            return CondoRepository.findOne(announcement.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return AnnouncementRepository.insert(announcement);
                })
                .then((object) => {
                    // insert image
                    return Promise.each(announcement.images, (image, index) => {
                        return Promise.resolve()
                            .then(() => {
                                let announcementImage = new AnnouncementImageModel();
                                announcementImage.announcementId = object.id;
                                announcementImage.imageURL = image;
                                announcementImage.orderIndex = index;
                                return AnnouncementImageRepository.insert(announcementImage);
                            });
                    })
                    .then(() => {
                        return AnnouncementRepository.findOne(object.id, related, filters);
                    })
                    .then(object => {
                        return Promise.each(listUnitIds, (unitId, index) => {
                            return AnnouncementUnitRepository.generate(object, unitId, isResidenceOwners, isResidenceTenants, isNonResidence);
                        })
                        .then(() => {
                            let userIds = [];
                            UserUnitService.findByListUnitId(object.condoId, isResidenceOwners, isResidenceTenants, isNonResidence, listUnitIds)
                            .then(data => {
                                if (data && data.length > 0) {
                                    return Promise.each(data, (item, index) => {
                                        if (userIds.indexOf(item.userId) === -1) {
                                            return Promise.resolve()
                                            .then(() => {
                                                userIds.push(item.userId);
                                            })
                                            .then(() => {
                                                return true;
                                            });
                                        }
                                    });
                                }
                            })
                            .then(() => {
                                // send push notification when user post new announcement
                                if (userIds.length > 0) {
                                    PushNotificationService.sendPostAnnouncement(userIds, object);
                                }
                            })
                            .catch(error => {
                                Logger.error(error.message, error);
                            });
                            return object;
                        });
                    });
                });
        }
        return Promise.resolve(null);
    }

    public update(announcement: AnnouncementModel, related = [], filters = []): Promise<AnnouncementModel> {
        if (announcement != null) {
            return CondoRepository.findOne(announcement.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return AnnouncementRepository.update(announcement);
                })
                .then((object) => {
                    return AnnouncementImageRepository.deleteByAnnouncementId(announcement.id);
                })
                .then((object) => {
                    // insert image
                    return Promise.each(announcement.images, (image, index) => {
                        return Promise.resolve()
                            .then(() => {
                                let announcementImage = new AnnouncementImageModel();
                                announcementImage.announcementId = announcement.id;
                                announcementImage.imageURL = image;
                                announcementImage.orderIndex = index;
                                return AnnouncementImageRepository.insert(announcementImage);
                            });
                    })
                        .then(() => {
                            return AnnouncementRepository.findOne(announcement.id, related, filters);
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
        return AnnouncementRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AnnouncementModel>> {
        return AnnouncementRepository.search(searchParams, offset, limit, related, filters)
        .then(result => {
            let objects: AnnouncementModel[] = result.data;
            let multi = Redis.getClient().multi();
            objects.forEach(item => {
                let key = Redis.getAnnouncementCountKey(item.id);
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
        let announcement = new AnnouncementModel();
        announcement.id = id;
        announcement.expiryDate = momentTz();
        return AnnouncementRepository.update(announcement);
    }

    public read(id: string, userId, related = [], filters = []): Promise<any> {
        let key = Redis.getAnnouncementCountKey(id);

        return AnnouncementRepository.findOne(id)
            .then(object => {
                if (object === null || object.isDeleted === true) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.ANNOUNCEMENT_INVALID.CODE,
                        ErrorCode.RESOURCE.ANNOUNCEMENT_INVALID.MESSAGE,
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
                    let announcementView = new AnnouncementViewModel();
                    announcementView.announcementId = id;
                    announcementView.userId = userId;
                    return AnnouncementViewRepository.insert(announcementView)
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

export default AnnouncementService;
