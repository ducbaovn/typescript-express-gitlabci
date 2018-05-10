/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import * as _ from "lodash";
import {BaseService} from "./base.service";
import {ExceptionModel, CollectionWrap, AdvertisingCondoModel, AdvertisingTemplateModel} from "../models";
import {
    AdvertiserRepository, AdvertisingCondoRepository, CondoRepository, UsefulContactsCategoryRepository,
    AdvertisingTemplateRepository, RatingAdvertisingTemplateRepository
} from "../data";
import {HttpStatus, Logger} from "../libs/index";
import {ErrorCode} from "../libs/error_code";
import {ADVERTISING_TEMPLATE_TABLE_SCHEMA, RATING_ADVERTISING_TEMPLATE_SCHEMA} from "../data/sql/schema";

export class AdvertisingCondoService extends BaseService<AdvertisingCondoModel, typeof AdvertisingCondoRepository> {
    constructor() {
        super(AdvertisingCondoRepository);
    }

    /**
     * Get all template by condo.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {any}
     */
    public getAllTemplateByCondo(searchParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertisingCondoModel>> {
        return AdvertisingCondoRepository.getAllTemplateByCondo(searchParams, offset, limit, related, filters);
    }

    /**
     * Get advertising by condo detail by id.
     *
     * @param templateId
     * @param related
     * @param filters
     * @returns {Promise<AdvertisingCondoModel>}
     */
    public getAdvertisingByCondoDetail(templateId: string, related = [], filters = []): Promise<AdvertisingCondoModel> {
        return AdvertisingCondoRepository.findOne(templateId,  ["advertiser", "condo", "category", "subCategory", "advertisingTemplate.pictures", "advertisingTemplate.templateRatings"], filters);
    }

    /**
     * Function assign the template to condo.
     *
     * @param dataModel
     * @returns {any}
     */
    public assignTemplateToCondo(dataModel: AdvertisingCondoModel): Promise<AdvertisingCondoModel> {
        if (dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    return this.checkConstraintLogic(dataModel);
                })
                .then((result) => {
                    if (result) {
                        // Insert new advertising for condo.
                        return AdvertisingCondoRepository.insert(dataModel)
                            .then(result => {
                                return AdvertisingCondoModel.fromDto(result);
                            })
                            .catch(err => {
                                Logger.error(err.message, err);
                                return Promise.reject(err);
                            });
                    } else {
                        return null;
                    }
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Update advertising template to condo.
     *
     * @param id
     * @param dataModel
     * @returns {any}
     */
    public updateTemplateToCondo(id: string, dataModel: AdvertisingCondoModel): Promise<AdvertisingCondoModel> {
        if (id != null && dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    return AdvertisingCondoRepository.findOne(id);
                })
                .then(item => {
                    if (item === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    }

                    // Re-check the constraint all fields inside the model before update.
                    return this.checkConstraintLogic(dataModel);
                })
                .then(flagObj => {
                    if (flagObj) {
                        dataModel.id = id;

                        // Action update advertising to condo.
                        return AdvertisingCondoRepository.update(dataModel);
                    }

                    return null;
                })
                .then(result => {
                    if (result != null) {
                        return AdvertisingCondoModel.fromDto(result);
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
     * Remove advertising template by id.
     *
     * @param recordId
     * @returns {any}
     */
    public deleteTemplateToCondo(recordId: string): Promise<any> {
        if (recordId != null && recordId !== "") {
            return Promise.resolve()
                .then(() => {
                    return AdvertisingCondoRepository.findOne(recordId);
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
                        return AdvertisingCondoRepository.deleteLogic(recordId);
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
     * Function check constraint all business logic before action create/update record.
     *
     * @param dataModel
     * @returns {any}
     */
    private checkConstraintLogic(dataModel: AdvertisingCondoModel): Promise<any> {
        if (dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    // Check advertiser existing.
                    return AdvertiserRepository.getAdvertiserBy(dataModel.advertiserId);
                })
                .then((advertiser) => {
                    if (advertiser == null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ADVERTISER_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.ADVERTISER_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }

                    // Check condo existing.
                    return CondoRepository.findOne(dataModel.condoId);
                })
                .then(condo => {
                    if (condo == null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }

                    // Check category existing inside condo.
                    if (dataModel.categoryId != null && dataModel.categoryId !== "") {
                        return UsefulContactsCategoryRepository.getCategoryDetailBy(dataModel.condoId, dataModel.categoryId)
                            .then(item => {
                                if (item == null) {
                                    return Promise.reject(new ExceptionModel(
                                        ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.CODE,
                                        ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.MESSAGE,
                                        false,
                                        HttpStatus.BAD_REQUEST));
                                }

                                return item;
                            })
                            .catch(err => {
                                Logger.error(err.message, err);
                                return Promise.reject(err);
                            });
                    } else {
                        return true;
                    }
                })
                .then(flagObj => {
                    if (flagObj) {
                        // Check template existing.
                        return AdvertisingTemplateRepository.findOne(dataModel.templateId)
                            .then((item) => {
                                if (item == null) {
                                    return Promise.reject(new ExceptionModel(
                                        ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.CODE,
                                        ErrorCode.RESOURCE.TEMPLATE_NOT_FOUND.MESSAGE,
                                        false,
                                        HttpStatus.BAD_REQUEST));
                                }

                                // Check the owner permission.
                                if (item.advertiserId.toLowerCase() !== dataModel.advertiserId.toLowerCase()) {
                                    return Promise.reject(new ExceptionModel(
                                        ErrorCode.RESOURCE.TEMPLATE_NOT_INSIDE_ADVERTISER.CODE,
                                        ErrorCode.RESOURCE.TEMPLATE_NOT_INSIDE_ADVERTISER.MESSAGE,
                                        false,
                                        HttpStatus.BAD_REQUEST));
                                }

                                return true;
                            })
                            .catch(err => {
                                Logger.error(err.message, err);
                                return Promise.reject(err);
                            });
                    } else {
                        return null;
                    }
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Randomize list template by subcategory
     *
     * @param recordId
     * @returns {any}
     */
    public randomizeListTemplateBySubcategory(advertisingCondo: AdvertisingCondoModel[]): AdvertisingTemplateModel[] {
        let result: AdvertisingTemplateModel[] = [];
        let groupSubcategory = _.groupBy(advertisingCondo, "subCategoryId");
        for (let subcategoryId in groupSubcategory) {
            let sample = _.sample(groupSubcategory[subcategoryId]);
            sample.advertisingTemplate.subCategory = sample.subCategory;
            result.push(sample.advertisingTemplate);
        }
        return result;
    }
}

export default AdvertisingCondoService;
