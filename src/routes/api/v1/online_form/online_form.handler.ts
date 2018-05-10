/**
 * Created by davidho on 2/9/17.
 */

import * as express from "express";
import * as Promise from "bluebird";
import {BaseHandler} from "../base.handler";
import {SessionModel, ExceptionModel, StateModel, OnlineFormCategoryModel, OnlineFormSubCategoryModel, OnlineFormRequestModel, OnlineFormRequestItemsModel} from "../../../../models";
import {ROLE, PROPERTIES, EXTENDED_HEADER, ONLINE_FORM_STATUS, ONLINE_FORM_REQUEST_ITEM_STATUS} from "../../../../libs/constants";
import {ErrorCode, HttpStatus} from "../../../../libs/index";
import {OnlineFormService} from "../../../../interactors/index";

export class OnlineFormHandler extends BaseHandler {

    /**
     * get list
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listCategory(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let queryParams = req.query || null;
            return OnlineFormService.searchCategory(queryParams, ["subCategories"], ["isDeleted"])
                .then(object => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));

                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    public static createCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let onlineFormCategory = OnlineFormCategoryModel.fromRequest(req);
            if (OnlineFormHandler.checkConstraintField(onlineFormCategory) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return OnlineFormService.createCategory(onlineFormCategory)
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

    public static editCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let onlineFormCategory = OnlineFormCategoryModel.fromRequest(req);
            onlineFormCategory.id = req.params.id || "";

            if (OnlineFormHandler.checkConstraintField(onlineFormCategory) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return OnlineFormService.updateCategory(onlineFormCategory)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }


    public static viewCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return OnlineFormService.viewOnlineFormCategoryById(req.params.id, ["subCategories"], ["isDeleted"])
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static removeCategory(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let onlineFormId = req.params.id || "";

            return OnlineFormService.removeOnlineFormCategoryById(onlineFormId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
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
     * get list sub
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listSub(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let queryParams = req.query || null;

            return OnlineFormService.searchSub(queryParams, ["onlineFormCategory", "price"], ["isDeleted"])
                .then(object => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));

                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    public static createSub(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let onlineFormSub = OnlineFormSubCategoryModel.fromRequest(req);
            if (OnlineFormHandler.checkConstraintFieldSubCategory(onlineFormSub) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return OnlineFormService.createSub(onlineFormSub)
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

    public static editSub(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let onlineFormSub = OnlineFormSubCategoryModel.fromRequest(req);
            onlineFormSub.id = req.params.id || "";

            if (OnlineFormHandler.checkConstraintFieldSubCategory(onlineFormSub) === false) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }

            return OnlineFormService.updateSub(onlineFormSub)
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(StateModel.updateSuccessful(object.id));
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static viewSub(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            return OnlineFormService.viewOnlineFormSubCategoryById(req.params.id, ["onlineFormCategory", "price"], ["isDeleted"])
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static removeSub(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();
            let onlineFormSubId = req.params.id || "";

            return OnlineFormService.removeOnlineFormSubCategoryById(onlineFormSubId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
                    }

                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    // submitV2 is only submit online form, no payment because of being waited for approval
    public static submitV2(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let session = res.locals.session || SessionModel.empty();
        let onlineFormRequest = OnlineFormRequestModel.fromRequest(req);
        let fromCM = false;
        if (session.roleId === ROLE.CONDO_MANAGER) {
            fromCM = true;
        } else {
            onlineFormRequest.userId = session.userId;
        }
        return OnlineFormService.submitV2(onlineFormRequest, fromCM)
        .then(object => {
            if (object != null) {
                res.status(HttpStatus.OK);
                res.json(StateModel.createSuccessful(object.id));
            } else {
                res.status(HttpStatus.BAD_REQUEST);
                res.json(StateModel.stateError(ErrorCode.RESOURCE.SAVE_FAILED.CODE, ErrorCode.RESOURCE.SAVE_FAILED.MESSAGE));
            }
        })
        .catch(err => {
            next(err);
        });
    }

    public static listRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.CONDO_MANAGER) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            let offset = parseInt(req.query.offset, 10) || null;
            let limit = parseInt(req.query.limit, 10) || null;
            let queryParams = req.query || null;

            return OnlineFormService.listRequest(queryParams, offset, limit, ["user", "unit", "onlineFormSubCategory", "onlineFormSubCategory.price", "onlineFormSubCategory.onlineFormCategory", "unit.floor", "unit.floor.block"], ["isDeleted", "role", "password"])
                .then(object => {
                    res.header(PROPERTIES.HEADER_TOTAL, object.total.toString(10));

                    res.status(HttpStatus.OK);
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }

    }

    /**
     * [CM] resolve request online form
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static updateItemStatus(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let userManager = session.user;

        Promise.resolve()
        .then(() => {
            let requestItemId = req.params.id || "";
            if (req.body.status === ONLINE_FORM_REQUEST_ITEM_STATUS.RESOLVED) {
                let remarks = req.body.remarks || "";
                let serialNumber = req.body.serialNumber || "";
                if (serialNumber === "") {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                        ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                return OnlineFormService.resolveRequest(requestItemId, remarks, serialNumber);
            } else if (req.body.status === ONLINE_FORM_REQUEST_ITEM_STATUS.ARCHIVED) {
                return OnlineFormService.archiveOnlineFormRequestItemsById(requestItemId);
            } else if (req.body.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                return OnlineFormService.approveRequest(requestItemId);
            } else if (req.body.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                return OnlineFormService.rejectRequest(requestItemId, userManager);
            }
        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * [CM] update request online form
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static updateItemRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        let session = res.locals.session || SessionModel.empty();
        let userManager = session.user;

        Promise.resolve()
        .then(() => {
            let requestItemId = req.params.id || "";
            let remarks = req.body.remarks || "";
            let serialNumber = req.body.serialNumber || "";
            return OnlineFormService.updateItemRequest(requestItemId, remarks, serialNumber);

        })
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful());
        })
        .catch(err => {
            next(err);
        });
    }

    /**
     * [CM] archive request online form
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static archiveRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let requestId = req.params.id || "";
            return OnlineFormService.archiveOnlineFormRequestItemsById(requestId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.updateSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.updateUnSuccessful());
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
     * [CM] delete request online form
     * @param req
     * @param res
     * @param next
     * @returns {Bluebird<U>}
     */
    public static deleteItemRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let requestItemId = req.params.id || "";
            return OnlineFormService.removeOnlineFormRequestItemsById(requestItemId)
                .then((object) => {
                    if (object === true) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteSuccessful());
                    } else {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.deleteUnSuccessful());
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
     * get list category template of online Form (SA)
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listCategoryTemplate(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            return Promise.resolve()
                .then(() => {
                    return OnlineFormService.listCategoryTemplate(["subCategories"], ["isDeleted", "isEnable"]);
                })
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.setHeader(EXTENDED_HEADER.HEADER_TOTAL, object.total.toString());
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }

    /**
     * get list sub category template by category id of online Form (SA)
     * @param req
     * @param res
     * @param next
     * @returns {any}
     */
    public static listSubCategoryTemplate(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let session = res.locals.session || SessionModel.empty();
            let onlineFormCategoryTemplateId = req.params.id || "";

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }
            return Promise.resolve()
                .then(() => {
                    return OnlineFormService.listSubCategoryTemplate(onlineFormCategoryTemplateId, ["category"], ["isDeleted", "isEnable"]);
                })
                .then((object) => {
                    res.status(HttpStatus.OK);
                    res.setHeader(EXTENDED_HEADER.HEADER_TOTAL, object.total.toString());
                    res.json(object.data);
                })
                .catch(err => {
                    next(err);
                });

        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintField(data: OnlineFormCategoryModel): boolean {
        let result = true;
        if (data.name === "" || data.condoId === "") {
            result = false;
        }
        return result;
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    public static checkConstraintFieldSubCategory(data: OnlineFormSubCategoryModel): boolean {
        let result = true;
        if (data.name === "" || data.condoId === "" || data.subTemplateId === "" || data.categoryId === "") {
            result = false;
        }
        return result;
    }

    // reset online form request counter on Firebase
    public static resetCounter(req: express.Request, res: express.Response, next: express.NextFunction) {
        return OnlineFormService.resetCounter()
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(StateModel.updateSuccessful());
            })
            .catch(err => {
                next(err);
            });
    }
}

export default OnlineFormHandler;
