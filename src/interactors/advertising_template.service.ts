/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { ExceptionModel, CollectionWrap, AdvertisingTemplateModel } from "../models";
import {
    AdvertiserRepository,
    AdvertisingImageRepository,
    AdvertisingTemplateRepository, RatingAdvertisingTemplateRepository
} from "../data";
import { HttpStatus, Logger } from "../libs/index";
import { ErrorCode } from "../libs/error_code";
import { RATING_ADVERTISING_TEMPLATE_SCHEMA } from "../data/sql/schema";

export class AdvertisingTemplateService extends BaseService<AdvertisingTemplateModel, typeof AdvertisingTemplateRepository> {
    constructor() {
        super(AdvertisingTemplateRepository);
    }

    /**
     * Get all advertising template.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {any}
     */
    public getAllAdvertisingTemplate(searchParams: any = {}, offset?: number, limit?: number, related = ["templateRatings"], filters = []): Promise<CollectionWrap<AdvertisingTemplateModel>> {
        return AdvertisingTemplateRepository.getAllAdvertisingTemplate(searchParams, offset, limit, related, filters);
    }

    /**
     * Get advertising template detail by id.
     *
     * @param templateId
     * @param related
     * @param filters
     * @returns {Promise<AdvertisingTemplateModel>}
     */
    public getAdvertisingTemplateDetail(templateId: string, related = [], filters = []): Promise<AdvertisingTemplateModel> {
        return AdvertisingTemplateRepository.findOne(templateId, ["advertiser", "pictures", "templateRatings"], filters);
    }

    /**
     * Function create new template for advertiser.
     *
     * @param dataModel
     * @returns {any}
     */
    public createTemplate(dataModel: AdvertisingTemplateModel): Promise<AdvertisingTemplateModel> {
        if (dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    return AdvertiserRepository.getAdvertiserBy(dataModel.advertiserId);
                })
                .then(user => {
                    if (user == null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ADVERTISER_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.ADVERTISER_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }

                    return AdvertisingTemplateRepository.insert(dataModel);
                })
                .then(result => {
                    if (result) {
                        // Insert list picture for template.
                        if (dataModel.pictures != null && dataModel.pictures.length > 0) {
                            dataModel.pictures.forEach(item => {
                                item.id = null;
                                item.templateId = result.id;

                                AdvertisingImageRepository.insert(item)
                                    .catch(err => {
                                        Logger.error(err.message, err);
                                    });
                            });
                        }

                        return AdvertisingTemplateModel.fromDto(result);
                    }

                    return null;
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Update advertising template.
     *
     * @param templateId
     * @param dataModel
     * @returns {any}
     */
    public updateTemplate(templateId: string, dataModel: AdvertisingTemplateModel): Promise<AdvertisingTemplateModel> {
        if (templateId != null && dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    return AdvertisingTemplateRepository.findOne(templateId);
                })
                .then(item => {
                    if (item === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    } else {
                        dataModel.id = templateId;

                        return AdvertisingTemplateRepository.update(dataModel);
                    }
                })
                .then(result => {
                    // Update pictures inside the template.
                    if (dataModel.pictures != null && dataModel.pictures.length > 0) {
                        dataModel.pictures.forEach(item => {
                            if (item.id != null) {  // Update advertising image for template.
                                if (item.imageUrl != null && item.imageUrl !== "") {
                                    AdvertisingImageRepository.update(item).catch(err => {
                                        Logger.error(err.message, err);
                                    });
                                } else {    // Remove picture inside template.
                                    AdvertisingImageRepository.forceDelete(item.id).catch(err => {
                                        Logger.error(err.message, err);
                                    });
                                }

                            } else {    // Insert new image for template
                                AdvertisingImageRepository.insert(item).catch(err => {
                                    Logger.error(err.message, err);
                                });
                            }
                        });
                    }

                    return AdvertisingTemplateModel.fromDto(result);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Delete advertising template by id.
     *
     * @param templateId
     * @returns {any}
     */
    public deleteTemplate(templateId: string): Promise<any> {
        if (templateId != null && templateId !== "") {
            return Promise.resolve()
                .then(() => {
                    return AdvertisingTemplateRepository.findOne(templateId);
                })
                .then(item => {
                    if (item === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    } else {
                        return AdvertisingTemplateRepository.deleteLogic(templateId);
                    }
                })
                .then(result => {
                    return result;
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * userId, AdvertisingTemplateModel[] -> Promise<AdvertisingTemplateModel[]>
     * @param templates
     */
    public checkIsRating (userId: string, templates: AdvertisingTemplateModel[]): Promise<AdvertisingTemplateModel[]> {
        // check whether this user rated or not for each template
        return Promise.each(templates, (template, temIndex) => {
                return RatingAdvertisingTemplateRepository.findOneByQuery(q => {
                    q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID, template.id);
                    q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID, userId);
                })
                    .then (rating => {
                        if (rating !== null) {
                            templates[temIndex].isRating = true;
                            templates[temIndex].myRatingValue = rating.ratingValue;
                        } else {
                            templates[temIndex].isRating = false;
                        }
                    });
            })
            .then(() => {
                return templates;
            });
    }
}

export default AdvertisingTemplateService;
