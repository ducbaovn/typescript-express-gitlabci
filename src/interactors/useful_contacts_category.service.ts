/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {ExceptionModel, CollectionWrap, UsefulContactsCategoryModel, UsefulContactsSubCategoryModel} from "../models";
import {
    CondoRepository, RatingAdvertisingTemplateRepository,
    UsefulCategoryTemplateRepository,
    UsefulContactsCategoryRepository,
    UsefulContactsSubCategoryRepository,
    UsefulSubCategoryTemplateRepository
} from "../data";
import {HttpStatus} from "../libs/index";
import {ErrorCode} from "../libs/error_code";
import {RATING_ADVERTISING_TEMPLATE_SCHEMA} from "../data/sql/schema";

export class UsefulContactsCategoryService extends BaseService<UsefulContactsCategoryModel, typeof UsefulContactsCategoryRepository> {
    constructor() {
        super(UsefulContactsCategoryRepository);
    }

    // region Category
    /**
     * Get list useful categories by condo.
     *
     * @param searchParams
     * @param related
     * @param filters
     * @returns {any}
     */
    public getCategoriesByCondo(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<UsefulContactsCategoryModel>> {
        return UsefulContactsCategoryRepository.getCategoriesByCondo(searchParams, offset, limit, related, filters)
        .then(result => {
            if (!searchParams.isAdmin || result.total > 0) {
                return result;
            } else {
                // TODO: Thanh - Will be removed in the future, all data template will be created while create new condo from system admin.
                let condoId = searchParams.condoId;

                return this.autoGenerateCategoryDefault(condoId)
                .then(() => {
                    return UsefulContactsCategoryRepository.getCategoriesByCondo(searchParams, offset, limit, related, filters);
                });
            }
        });
    }

    /**
     * Method auto generate useful contacts default for condo.
     *
     * @param condoId
     * @returns {Bluebird<Array>}
     */
    public autoGenerateCategoryDefault(condoId: string): Promise<any> {
        return Promise.resolve()
        .then(() => {
            return UsefulCategoryTemplateRepository.getCategoryTemplate();
        })
        .then(items => {
            return Promise.each(items, item => {
                let categoryModel = UsefulContactsCategoryModel.makeModelFromTemplate(condoId, item);
                let categoryId = "";

                return UsefulContactsCategoryRepository.insert(categoryModel)
                .then((category) => {
                    categoryId = category.id;

                    // Get all sub-category default by category template.
                    return UsefulSubCategoryTemplateRepository.getByCategory(item.id);
                })
                .then(subCat => {
                    return Promise.each(subCat.data, subCatItem => {
                        let subCatModel = UsefulContactsSubCategoryModel.makeModelFromTemplate(categoryId, subCatItem);

                        // Generate list sub-category for condo.
                        return UsefulContactsSubCategoryRepository.insert(subCatModel);
                    });
                });
            });
        });
    }

    /**
     * Get useful category detail by id.
     *
     * @param categoryId
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<UsefulContactsCategoryModel>>}
     */
    public getCategoryDetail(userId: string, categoryId: string, related = [], filters = []): Promise<UsefulContactsCategoryModel> {
        return UsefulContactsCategoryRepository.findOne(categoryId, related, filters)
            // check whether this user rated or not for each template
            .then(category => {
                if (category.subCategories == null || !category.subCategories.length) {
                    return category;
                }
                return Promise.each(category.subCategories, (subCat, subIndex) => {
                        if (subCat.templates && subCat.templates.length > 0) {
                            return Promise.each(subCat.templates, (template, temIndex) => {
                                return RatingAdvertisingTemplateRepository.findOneByQuery(q => {
                                    q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID, template.id);
                                    q.where(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID, userId);
                                })
                                    .then (rating => {
                                        if (rating !== null) {
                                            category.subCategories[subIndex].templates[temIndex].isRating = true;
                                            category.subCategories[subIndex].templates[temIndex].myRatingValue = rating.ratingValue;
                                        } else {
                                            category.subCategories[subIndex].templates[temIndex].isRating = false;
                                        }
                                    });
                            });
                        }
                    })
                    .then(() => {
                        return category;
                    });
            });
    }

    /**
     * Function create new category for condo.
     *
     * @param categoryModel
     * @returns {any}
     */
    public createCategory(categoryModel: UsefulContactsCategoryModel): Promise<UsefulContactsCategoryModel> {
        return Promise.resolve()
        .then(() => {
            return CondoRepository.findOne(categoryModel.condoId);
        })
        .then(condo => {
            if (condo === null || condo.isEnable === false) {
                return Promise.reject(new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return UsefulContactsCategoryRepository.insert(categoryModel);
        });
    }

    /**
     * Update useful contacts category for condo.
     *
     * @param categoryId
     * @param categoryModel
     * @returns {any}
     */
    public updateCategory(categoryId: string, categoryModel: UsefulContactsCategoryModel): Promise<UsefulContactsCategoryModel> {
        return Promise.resolve()
        .then(() => {
            return UsefulContactsCategoryRepository.findOne(categoryId);
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
            categoryModel.id = categoryId;
            return UsefulContactsCategoryRepository.update(categoryModel);
        });
    }

    /**
     * Delete category by category id.
     *
     * @param categoryId
     * @returns {any}
     */
    public deleteCategory(categoryId: string): Promise<UsefulContactsCategoryModel> {
        return Promise.resolve()
        .then(() => {
            return UsefulContactsCategoryRepository.findOne(categoryId);
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
            return UsefulContactsCategoryRepository.deleteLogic(categoryId);
        });
    }

    // endregion

    // region Sub-Category
    /**
     * Function get sub-category detail.
     *
     * @param subCategoryId
     * @param related
     * @param filters
     * @returns {Promise<UsefulContactsSubCategoryModel>}
     */
    public getSubCategoryDetail(subCategoryId: string, related = [], filters = []): Promise<UsefulContactsSubCategoryModel> {
        return UsefulContactsSubCategoryRepository.findOne(subCategoryId, related, filters);
    }

    /**
     * Function create new sub-category.
     *
     * @param subCatModel
     * @returns {any}
     */
    public createSubCategory(subCatModel: UsefulContactsSubCategoryModel): Promise<UsefulContactsSubCategoryModel> {
        return Promise.resolve()
        .then(() => {
            // Check category existing.
            return UsefulContactsCategoryRepository.findOne(subCatModel.categoryId);
        })
        .then(catFromDb => {
            if (catFromDb == null) {
                return Promise.reject(new ExceptionModel(
                    ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                ));
            }

            return UsefulContactsSubCategoryRepository.insertGet(subCatModel);
        });
    }

    /**
     * Function update sub-category.
     *
     * @param subCategoryId
     * @param subCategoryModel
     * @returns {any}
     */
    public updateSubCategory(subCategoryId: string, subCategoryModel: UsefulContactsSubCategoryModel): Promise<UsefulContactsSubCategoryModel> {
        return Promise.resolve()
        .then(() => {
            return UsefulContactsSubCategoryRepository.findOne(subCategoryId);
        })
        .then(item => {
            if (item == null) {
                return Promise.reject(new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                ));
            }
            // Check category existing before update.
            return UsefulContactsCategoryRepository.findOne(subCategoryModel.categoryId);
        })
        .then(catFromDb => {
            if (catFromDb == null) {
                return Promise.reject(new ExceptionModel(
                    ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                ));
            }

            // Action update sub-category info.
            subCategoryModel.id = subCategoryId;
            return UsefulContactsSubCategoryRepository.update(subCategoryModel);
        });
    }

    /**
     * Function delete sub-category by id.
     *
     * @param subCategoryId
     * @returns {any}
     */
    public deleteSubCategory(subCategoryId: string): Promise<UsefulContactsSubCategoryModel> {
        return Promise.resolve()
        .then(() => {
            return UsefulContactsSubCategoryRepository.findOne(subCategoryId);
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
            return UsefulContactsSubCategoryRepository.deleteLogic(subCategoryId);
        });
    }

    // endregion
}

export default UsefulContactsCategoryService;
