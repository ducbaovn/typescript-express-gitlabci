/**
 * Created by thanhphan on 4/5/17.
 */
import * as express from "express";
import * as Promise from "bluebird";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {UsefulContactsCategoryModel, ExceptionModel, StateModel, UsefulContactsSubCategoryModel, SessionModel} from "../../../../models";
import {AdvertiserService, AdvertisingCondoService, UsefulContactsCategoryService} from "../../../../interactors";
import {CondoRepository} from "../../../../data/index";
import {ADVERTISING_TEMPLATE_TYPE, PROPERTIES, ROLE} from "../../../../libs/constants";

export class UsefulContactsHandler {

    // region Category
    /**
     * Function get list categories by condo. If role is admin, return all list, if not, return categories which is not empty template
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {
        let condoId = req.params.condo_id || "";
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let session = res.locals.session || SessionModel.empty();
        let searchParams = {
            condoId: condoId,
            isAdmin: false
        };
        if (session.roleId === ROLE.CONDO_MANAGER || session.roleId === ROLE.SYSTEM_ADMIN) {
            searchParams.isAdmin = true;
        }

        // Check condo existing before get or generate list useful contacts for condo.
        return Promise.resolve()
            .then(() => {
                return CondoRepository.findOne(condoId);
            })
            .then(condo => {
                if (condo == null || !condo.isEnable) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                return UsefulContactsCategoryService.getCategoriesByCondo(searchParams, offset, limit, []);
            })
            .then(result => {
                res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));
                if (offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                }
                res.status(HttpStatus.OK);
                res.json(result.data);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Function get category detail. If role is admin, return all list, if not, return subcategories which is not empty template
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static detail(req: express.Request, res: express.Response, next: express.NextFunction) {
        let categoryId = req.params.id || "";
        let session = res.locals.session || SessionModel.empty();
        let related = ["condo", "subCategoriesNotEmpty.advertisingCondos.advertisingTemplate.advertiser", "subCategoriesNotEmpty.advertisingCondos.advertisingTemplate.pictures", "subCategoriesNotEmpty.advertisingCondos.advertisingTemplate.templateRatings"];
        if (session.roleId === ROLE.CONDO_MANAGER || session.roleId === ROLE.SYSTEM_ADMIN) {
            related = ["condo", "subCategories.advertisingCondos.advertisingTemplate.pictures"];
        }

        return Promise.resolve()
            .then(() => {
                return UsefulContactsCategoryService.getCategoryDetail(session.userId, categoryId, related);
            })
            .then(item => {
                if (item != null && item.id != null) {
                    res.status(HttpStatus.OK);
                    res.json(item);
                } else {
                    next(new ExceptionModel(
                        ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.NOT_FOUND,
                    ));
                }
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Add new useful category for condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let condoId = req.params.condo_id || "";
        let categoryModelReq = UsefulContactsCategoryModel.fromRequest(req);

        categoryModelReq.condoId = condoId;

        if (!UsefulContactsHandler.checkConstraintFieldCategory(categoryModelReq)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UsefulContactsCategoryService.createCategory(categoryModelReq)
            .then(object => {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful(object.id));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Function update useful contacts category for condo.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static update(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let categoryId = req.params.id || "";
        let categoryModelReq = UsefulContactsCategoryModel.fromRequest(req);

        // Validate constraint all fields.
        if (categoryId === "" || !UsefulContactsHandler.checkConstraintFieldCategory(categoryModelReq)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UsefulContactsCategoryService.updateCategory(categoryId, categoryModelReq)
            .then(() => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful(categoryId));
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Function delete useful contacts category by id.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let categoryId = req.params.id || "";

        if (categoryId === "") {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }

        return UsefulContactsCategoryService.deleteCategory(categoryId)
            .then(() => {
                res.status(HttpStatus.OK);
                res.json(StateModel.deleteSuccessful(categoryId));
            })
            .catch(err => {
                next(err);
            });
    }

    // endregion

    // region Sub-Category
    public static detailSubCategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let subCategoryId = req.params.id || "";

            return UsefulContactsCategoryService.getSubCategoryDetail(subCategoryId, ["category"])
                .then(item => {
                    if (item != null && item.id != null) {
                        res.status(HttpStatus.OK);
                        res.json(item);
                    } else {
                        next(new ExceptionModel(
                            ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.CODE,
                            ErrorCode.RESOURCE.CATEGORY_NOT_FOUND.MESSAGE,
                            false,
                            HttpStatus.NOT_FOUND,
                        ));
                    }
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function create new sub-category.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static createSubCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let subCatModelReq = UsefulContactsSubCategoryModel.fromRequest(req);

            if (!UsefulContactsHandler.checkConstraintFieldSubCategory(subCatModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return UsefulContactsCategoryService.createSubCategory(subCatModelReq)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.createSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function update sub-category.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static updateSubCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let subCategoryId = req.params.id || "";
            let subCatModelReq = UsefulContactsSubCategoryModel.fromRequest(req);

            // Validate constraint all fields.
            if (subCategoryId === "" || !UsefulContactsHandler.checkConstraintFieldSubCategory(subCatModelReq)) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return UsefulContactsCategoryService.updateSubCategory(subCategoryId, subCatModelReq)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(subCategoryId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Function delete sub-category.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static deleteSubCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let subCategoryId = req.params.id || "";

            if (subCategoryId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return UsefulContactsCategoryService.deleteSubCategory(subCategoryId)
                .then(() => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.deleteSuccessful(subCategoryId));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // endregion

    // region Partner by Service
    /**
     * Function get list partner by sub-category inside the useful contacts.
     *
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listPartner(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let serviceId = req.params.service_id || "";
            let searchParams = {
                subCategoryId: serviceId
            };

            if (serviceId === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return Promise.resolve()
                .then(() => {
                    return AdvertiserService.getListPartners(searchParams, offset, limit);
                })
                .then((result) => {
                    res.header(PROPERTIES.HEADER_TOTAL, result.total.toString(10));

                    if (offset != null) {
                        res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                    }
                    if (limit != null) {
                        res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                    }

                    res.status(HttpStatus.OK);
                    res.json(result.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // endregion

    // region Private Method
    /**
     * Method validate all fields into category model.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFieldCategory(dataModel: UsefulContactsCategoryModel): boolean {
        let result: boolean = false;

        if (dataModel != null) {
            if (dataModel.condoId != null && dataModel.condoId !== ""
                && dataModel.name != null && dataModel.name !== "") {
                result = true;
            }
        }

        return result;
    }

    /**
     * Method validate all fields into sub-category model.
     *
     * @param dataModel
     * @returns {boolean}
     */
    private static checkConstraintFieldSubCategory(dataModel: UsefulContactsSubCategoryModel): boolean {
        let result: boolean = false;

        if (dataModel != null) {
            if (dataModel.categoryId != null && dataModel.categoryId !== ""
                && dataModel.name != null && dataModel.name !== "") {
                result = true;
            }
        }

        return result;
    }

    // endregion
}

export default UsefulContactsHandler;
