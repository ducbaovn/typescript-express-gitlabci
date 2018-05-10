/**
 * Created by davidho on 2/9/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {
    CollectionWrap,
    ExceptionModel,
    OnlineFormCategoryTemplateModel,
    OnlineFormSubCategoryTemplateModel,
    OnlineFormCategoryModel,
    OnlineFormSubCategoryModel,
    OnlineFormFeeModel,
    OnlineFormModel,
    OnlineFormRequestItemsModel,
    OnlineFormRequestModel,
    TransactionHistoryModel,
    UserModel
} from "../models";
import {
    CondoRepository,
    OnlineFormCategoryTemplateRepository,
    OnlineFormSubCategoryTemplateRepository,
    OnlineFormCategoryRepository,
    OnlineFormSubCategoryRepository,
    OnlineFormFeeRepository,
    OnlineFormRepository,
    OnlineFormRequestItemsRepository,
    UserRepository
} from "../data";
import {ErrorCode, FirebaseAdmin, HttpStatus, Logger, Mailer} from "../libs";
import * as Schema from "../data/sql/schema";
import {DELETE_STATUS, ENABLE_STATUS, ONLINE_FORM, ONLINE_FORM_STATUS, TRANSACTION_ITEM_TYPE, ONLINE_FORM_REQUEST_ITEM_STATUS} from "../libs/constants";
import {PaymentSourceService, TransactionHistoryService} from "./index";

export class OnlineFormService extends BaseService<OnlineFormModel, typeof OnlineFormRepository> {
    constructor() {
        super(OnlineFormRepository);
    }

    public searchCategory(searchParams: any, related = [], filters = []): Promise<CollectionWrap<OnlineFormCategoryModel>> {
        return OnlineFormCategoryRepository.search(searchParams, related, filters);
    }

    public createCategory(onlineFormCategory: OnlineFormCategoryModel, related = [], filters = []): Promise<OnlineFormCategoryModel> {
        if (onlineFormCategory != null) {
            return CondoRepository.findOne(onlineFormCategory.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryTemplateRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID, onlineFormCategory.categoryTemplateId);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });
                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_TEMPLATE_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_TEMPLATE_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryRepository.insert(onlineFormCategory);
                })

                .then((object) => {
                    return OnlineFormCategoryRepository.findOne(object.id, related, filters);
                });
        }

        return Promise.resolve(null);
    }

    public searchSub(searchParams: any, related = [], filters = []): Promise<CollectionWrap<OnlineFormSubCategoryModel>> {
        return OnlineFormSubCategoryRepository.search(searchParams, related, filters);
    }

    public submitV2(onlineFormRequest: OnlineFormRequestModel, fromCM: boolean): Promise<any> {
        let onlineFormSubCategory: OnlineFormSubCategoryModel;
        return OnlineFormSubCategoryRepository.findOne(onlineFormRequest.onlineFormSubCategoryId, ["onlineFormCategory"])
        .then(object => {
            onlineFormSubCategory = object;
            if (!onlineFormSubCategory) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if (onlineFormRequest.validateOnlineForm(onlineFormSubCategory.category.categoryTemplateId) === false) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                );
            }
            let onlineFormRequestItemsArray = OnlineFormRequestItemsModel.fromOnlineFormRequest(onlineFormRequest);
            return Promise.each(onlineFormRequestItemsArray, onlineFormRequestItem => {
                return this.validateAndBuildOnlineFormRequest(onlineFormRequestItem)
                    .then(object => {
                        onlineFormRequestItem.payByCash = fromCM ? true : onlineFormRequestItem.condo.payByCash;
                        return this.createOnlineFormRequestItems(onlineFormRequestItem);
                    })
                    .then(result => {
                        // Starting payment charge
                        if (fromCM) {
                            return this.payment(onlineFormRequestItem);
                        }
                    })
                    .then(result => {
                        return OnlineFormRequestItemsRepository.findOne(onlineFormRequestItem.id, ["user.condo", "user.unit.floor.block", "onlineFormSubCategory.onlineFormCategory"]);
                    })
                    .then(object => {
                        if (object !== null) {
                            this.processSendMail(object);
                            // Update counter online forms.
                            this.updateCounterOnlineForms(onlineFormSubCategory.condoId, true)
                                .catch(err => Logger.error(err.message, err));
                        }
                        return onlineFormRequest;
                    });
            });
        });
    }

    /**
     * [CM]
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public approveRequest(id: string): Promise<any> {
        let onlineFormRequestItem: OnlineFormRequestItemsModel;

        return OnlineFormRequestItemsRepository.findOne(id, ["user.unit.floor.block", "condo.paymentGatewayAccount", "onlineFormSubCategory.onlineFormCategory"])
            .then(object => {
                if (!object || object.status !== ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                onlineFormRequestItem = object;
                onlineFormRequestItem.user.condo = onlineFormRequestItem.condo;
                if (!object.payByCash) {
                    return PaymentSourceService.findOrCreate(object.user, object.condo);
                }
                return null;
            })
            .then(paymentSource => {
                onlineFormRequestItem.user.paymentSource = paymentSource;
                onlineFormRequestItem.user.customerId = paymentSource ? paymentSource.customerId : null;
                return this.payment(onlineFormRequestItem);
            })
            .tap(result => {
                return this.processSendMail(onlineFormRequestItem);
            });
    }

    /**
     * [CM]
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public rejectRequest(id: string, userManager: UserModel): Promise<any> {
        let onlineFormRequestItem: OnlineFormRequestItemsModel;

        return OnlineFormRequestItemsRepository.findOne(id, ["user", "condo.paymentGatewayAccount", "onlineFormSubCategory.onlineFormCategory"])
            .then(object => {
                if (!object || object.status !== ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                onlineFormRequestItem = object;
                return OnlineFormRequestItemsRepository.updateStatus(onlineFormRequestItem, null, ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED);
            })
            .then(() => {
                // Decrease ths counter online forms after reject request.
                if (onlineFormRequestItem.condoId != null) {
                    this.updateCounterOnlineForms(onlineFormRequestItem.condoId , false)
                        .catch(err => Logger.error(err.message, err));
                }
            })
            .then(result => {
                return OnlineFormRequestItemsRepository.deleteLogic(id);
            })
            .tap(result => {
                return this.processSendMail(onlineFormRequestItem, userManager);
            });
    }

    /**
     * [CM]
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<U>}
     */
    public resolveRequest(id: string, remarks: string, serialNumber: string, related = [], filters = []): Promise<any> {
        let condoId: string;

        return OnlineFormRequestItemsRepository.findOne(id)
            .then(object => {
                if (object === null || object.isDeleted === true || (object.status !== ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED)) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                if (object != null) {
                    condoId = object.condoId;
                }

                object.status = ONLINE_FORM_REQUEST_ITEM_STATUS.RESOLVED;
                object.remarks = remarks;
                object.serialNumber = serialNumber;

                // object.dateResolved = momentTz.tz(new Date(), "UTC");
                return OnlineFormRequestItemsRepository.update(object);
            })
            .tap(() => {
                // Decrease ths counter online forms after resolve request.
                if (condoId != null) {
                    this.updateCounterOnlineForms(condoId, false)
                        .catch(err => Logger.error(err.message, err));
                }
            });
    }

    public payment(onlineFormRequestItem: OnlineFormRequestItemsModel): Promise<any> {
        if (!onlineFormRequestItem || !onlineFormRequestItem.condoId || !onlineFormRequestItem.userId || !onlineFormRequestItem.id || !onlineFormRequestItem.user) {
            return Promise.reject(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return OnlineFormRequestItemsRepository.findOne(onlineFormRequestItem.id, ["user.unit", "onlineFormSubCategory.onlineFormCategory"])
        .then(item => {
            if (!item) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                    ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            let transactionModel = new TransactionHistoryModel();

            transactionModel.condoId = onlineFormRequestItem.condoId;
            transactionModel.userId = onlineFormRequestItem.userId;
            transactionModel.itemId = onlineFormRequestItem.id;
            transactionModel.itemType = TRANSACTION_ITEM_TYPE.ONLINE_FORM;
            transactionModel.amount = onlineFormRequestItem.price || 0;
            transactionModel.customerId = onlineFormRequestItem.user.customerId;
            transactionModel.payByCash = onlineFormRequestItem.payByCash;
            transactionModel.name = item.onlineFormSubCategory.category.name;
            transactionModel.firstName = item.user.firstName;
            transactionModel.lastName = item.user.lastName;
            transactionModel.unitNumber = item.user.unitNumber;

            // Action payment if failed -> remove booking item.
            return TransactionHistoryService.saveTransaction(transactionModel);
        })
        .then(transaction => {
            let status = ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED;
            return OnlineFormRequestItemsRepository.updateStatus(onlineFormRequestItem, transaction.transactionId, status);
        });
    }

    /**
     * @param onlineForm
     * @returns {boolean}
     */
    public processSendMail(onlineForm: OnlineFormRequestItemsModel, userManager?: UserModel): boolean {
        if (onlineForm) {
            switch (onlineForm.onlineFormSubCategory.category.categoryTemplateId) {
                case ONLINE_FORM.ACCESS_CARD:
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                        Mailer.sendOnlineFormReceived(onlineForm);
                        Mailer.sendAccessCardReceivedToManager(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                        Mailer.sendAccessCardApproved(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                        Mailer.sendOnlineFormRejected(onlineForm, userManager);
                    }
                    break;
                case ONLINE_FORM.CAR_LABEL:
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                        Mailer.sendOnlineFormReceived(onlineForm);
                        Mailer.sendCarLabelReceivedToManager(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                        Mailer.sendCarLabelApproved(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                        Mailer.sendOnlineFormRejected(onlineForm, userManager);
                    }
                    break;
                case ONLINE_FORM.TRANSPONDER:
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                        Mailer.sendOnlineFormReceived(onlineForm);
                        Mailer.sendCarTransponderReceivedToManager(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                        Mailer.sendCarTransponderApproved(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                        Mailer.sendOnlineFormRejected(onlineForm, userManager);
                    }
                    break;
                case ONLINE_FORM.IU_REGISTRATION:
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                        Mailer.sendOnlineFormReceived(onlineForm);
                        Mailer.sendIURegistrationReceivedToManager(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                        Mailer.sendIURegistrationApproved(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                        Mailer.sendOnlineFormRejected(onlineForm, userManager);
                    }
                    break;
                case ONLINE_FORM.BICYCLE_TAG:
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.NEW) {
                        Mailer.sendOnlineFormReceived(onlineForm);
                        Mailer.sendBicycleTagReceivedToManager(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED) {
                        Mailer.sendBicycleTagApproved(onlineForm);
                    }
                    if (onlineForm.status === ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED) {
                        Mailer.sendOnlineFormRejected(onlineForm, userManager);
                    }
                    break;
            }
        }
        return true;
    }

    /**
     * [CM] get list request online form
     * @param searchParams
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<OnlineFormModel>>}
     */
    public listRequest(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<OnlineFormRequestItemsModel>> {
        return OnlineFormRequestItemsRepository.search(searchParams, offset, limit, related, filters)
            .then(ret => {
                return ret;
            });
    }

    /**
     * [CM] delete request item
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public archiveOnlineFormRequestItemsById(id: string, related = [], filters = []): Promise<boolean> {
        return OnlineFormRequestItemsRepository.findOne(id)
            .then(object => {
                if (object != null) {
                    object.status = ONLINE_FORM_REQUEST_ITEM_STATUS.ARCHIVED;
                    return OnlineFormRequestItemsRepository.update(object)
                        .then(object => {
                            if (object === null) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                } else {
                    return false;
                }
            });
    }

    /**
     * [CM] delete request item
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public removeOnlineFormRequestItemsById(id: string, related = [], filters = []): Promise<boolean> {
        return OnlineFormRequestItemsRepository.findOne(id)
            .then(object => {
                if (object != null) {
                    // if (object.onlineFormRequest != null) {
                        // Decrease ths counter online forms after delete request item.
                        // this.updateCounterOnlineForms(object.onlineFormRequest.condoId, false)
                        //     .catch(err => Logger.error(err.message, err));
                    // }

                    return OnlineFormRequestItemsRepository.deleteLogic(id)
                        .then(object => {
                            if (object === null) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                } else {
                    return false;
                }
            });
    }

    public updateItemRequest(id: string, remarks: string, serialNumber: string, related = [], filters = []): Promise<any> {
        return OnlineFormRequestItemsRepository.findOne(id, [])
            .then(object => {
                if (object === null || object.isDeleted === true) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                        ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                object.remarks = remarks;
                object.serialNumber = serialNumber;
                return OnlineFormRequestItemsRepository.update(object);
            });
    }


    /**
     * Get list category template online form. use for SA
     * @param related
     * @param filters
     */
    public listCategoryTemplate(related = [], filters = []): Promise<CollectionWrap<OnlineFormCategoryTemplateModel>> {
        let ret: CollectionWrap<OnlineFormCategoryTemplateModel> = new CollectionWrap<OnlineFormCategoryTemplateModel>();
        return OnlineFormCategoryTemplateRepository.findByQuery(q => {
            q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME, "ASC");
        }, related, filters)
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }

    /**
     * Get list sub category template by category template of online form. use for SA
     * @param related
     * @param filters
     */
    public listSubCategoryTemplate(onlineFormCategoryTemplateId, related = [], filters = []): Promise<CollectionWrap<OnlineFormSubCategoryTemplateModel>> {
        let ret: CollectionWrap<OnlineFormSubCategoryTemplateModel> = new CollectionWrap<OnlineFormSubCategoryTemplateModel>();
        return OnlineFormSubCategoryTemplateRepository.findByQuery(q => {
            q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            if (onlineFormCategoryTemplateId) {
                q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID, onlineFormCategoryTemplateId);
            }
            q.orderBy(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        }, related, filters)
            .then((objects) => {
                ret.data = objects;
                ret.total = objects.length;
                return ret;
            });
    }


    /**
     * remove online form by category id of condo. use for SA
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public removeOnlineFormCategoryById(id: string, related = [], filters = []): Promise<boolean> {
        return OnlineFormCategoryRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }


    public updateCategory(onlineFormCategory: OnlineFormCategoryModel, related = [], filters = []): Promise<OnlineFormCategoryModel> {
        if (onlineFormCategory != null) {
            return CondoRepository.findOne(onlineFormCategory.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryTemplateRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID, onlineFormCategory.categoryTemplateId);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });
                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_TEMPLATE_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_TEMPLATE_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryRepository.update(onlineFormCategory);
                })

                .then((object) => {
                    return OnlineFormCategoryRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    private validateAndBuildOnlineFormRequest(onlineFormRequestItem: OnlineFormRequestItemsModel): Promise<OnlineFormRequestItemsModel> {
        let onlineFormSubCategory: OnlineFormSubCategoryModel;
        return UserRepository.findOne(onlineFormRequestItem.userId, ["unit", "condo.paymentGatewayAccount"])
            .then(user => {
                if (!user || !user.unit) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.USER_INVALID.CODE,
                        ErrorCode.RESOURCE.USER_INVALID.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                onlineFormRequestItem.unitId = user.unit.id;
                onlineFormRequestItem.unit = user.unit;
                onlineFormRequestItem.user = user;
                onlineFormRequestItem.status = ONLINE_FORM_REQUEST_ITEM_STATUS.NEW;
                if (!user.condo.payByCash) {
                    return PaymentSourceService.findOrCreate(user, user.condo);
                }
                return null;
            })
            .then(paymentSource => {
                onlineFormRequestItem.user.paymentSource = paymentSource;
                onlineFormRequestItem.user.customerId = paymentSource ? paymentSource.customerId : null;
                return OnlineFormSubCategoryRepository.findOne(onlineFormRequestItem.onlineFormSubCategoryId, ["onlineFormCategory", "price", "condo.paymentGatewayAccount"]);
            })
            .then(object => {
                onlineFormSubCategory = object;
                onlineFormRequestItem.onlineFormSubCategory = object;

                if (onlineFormSubCategory === null || onlineFormSubCategory.isEnable === false || !onlineFormSubCategory.condo) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                onlineFormRequestItem.condoId = onlineFormSubCategory.condo.id;
                onlineFormRequestItem.condo = onlineFormSubCategory.condo;
                onlineFormRequestItem.price = onlineFormSubCategory.price;

                return onlineFormRequestItem;
            });
    }

    private createOnlineFormRequestItems(onlineFormRequestItem: OnlineFormRequestItemsModel): Promise<OnlineFormRequestItemsModel> {
        onlineFormRequestItem.isEnable = true;
        onlineFormRequestItem.status = ONLINE_FORM_REQUEST_ITEM_STATUS.NEW;
        return OnlineFormRequestItemsRepository.insert(onlineFormRequestItem)
        .then(result => {
            onlineFormRequestItem.id = result.id;
            return onlineFormRequestItem;
        });
    }

    /**
     * Update the counter online forms
     *
     * @param condoId
     * @param isIncrease
     * @param numberOfItems
     * @returns {Bluebird<U>}
     */
    private updateCounterOnlineForms(condoId: string, isIncrease: boolean = true, numberOfItems: number = 0): Promise<any> {
        // Counter the new feedback, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();

        return Promise.resolve()
            .then(() => {
                return fb.database().ref(`counter/${condoId}`)
                    .once("value")
                    .then((dataSnapshot) => {
                        let counter = {
                            onlineForms: 0
                        };

                        if (dataSnapshot != null && dataSnapshot.val() != null && dataSnapshot.val().onlineForms != null) {
                            if (isIncrease) {
                                counter.onlineForms = dataSnapshot.val().onlineForms + (numberOfItems > 0 ? numberOfItems : 1);
                            } else {
                                counter.onlineForms = dataSnapshot.val().onlineForms > 0 ? dataSnapshot.val().onlineForms - (numberOfItems > 0 ? numberOfItems : 1) : 0;
                            }
                        } else {
                            if (isIncrease) {
                                counter.onlineForms = (numberOfItems > 0 ? numberOfItems : 1);
                            }
                        }

                        return fb.database().ref("counter").child(`${condoId}`)
                            .update(counter)
                            .catch(err => Logger.error(err.message, err));
                    }).catch(err => Logger.error(err.message, err));
            })
            .catch(err => err => Logger.error(err.message, err));
    }

    /**
     * view online form category of condo. use for SA
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public viewOnlineFormCategoryById(id: string, related = [], filters = []): Promise<OnlineFormCategoryModel> {
        return OnlineFormCategoryRepository.findOne(id, related, filters)
            .then(object => {
                if (object) {
                    return object;
                } else {
                    return null;
                }
            });
    }

    public createSub(onlineFormSubCategory: OnlineFormSubCategoryModel, related = [], filters = []): Promise<OnlineFormSubCategoryModel> {
        if (onlineFormSubCategory != null) {
            return CondoRepository.findOne(onlineFormSubCategory.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormSubCategoryTemplateRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID, onlineFormSubCategory.subTemplateId);
                        q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });
                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID, onlineFormSubCategory.categoryId);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });

                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormSubCategoryRepository.insert(onlineFormSubCategory);
                })
                .then(object => {
                    let subCategory = object;
                    let fee = new OnlineFormFeeModel();
                    fee.price = onlineFormSubCategory.price;
                    fee.subCategoryId = subCategory.id;
                    return OnlineFormFeeRepository.insert(fee)
                    .then(data => {
                        return OnlineFormFeeRepository.findOne(data.id);
                    })
                    .then(data => {
                        if (data === null) {
                            return Promise.reject(new ExceptionModel(
                                ErrorCode.RESOURCE.ONLINE_FORM_FEE_INVALID.CODE,
                                ErrorCode.RESOURCE.ONLINE_FORM_FEE_INVALID.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST,
                            ));
                        }
                        return subCategory;
                    });
                })
                .then((object) => {
                    return OnlineFormSubCategoryRepository.findOne(object.id, related, filters);
                });
        }

        return Promise.resolve(null);
    }

    public updateSub(onlineFormSubCategory: OnlineFormSubCategoryModel, related = [], filters = []): Promise<OnlineFormSubCategoryModel> {
        if (onlineFormSubCategory != null) {
            return CondoRepository.findOne(onlineFormSubCategory.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormSubCategoryTemplateRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID, onlineFormSubCategory.subTemplateId);
                        q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });
                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormCategoryRepository.findOneByQuery(q => {
                        q.where(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID, onlineFormSubCategory.categoryId);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                        q.andWhere(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    });

                })
                .then(object => {
                    if (object === null) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_INVALID.CODE,
                            ErrorCode.RESOURCE.ONLINE_FORM_CATEGORY_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return OnlineFormSubCategoryRepository.update(onlineFormSubCategory);
                })
                .then(object => {
                    let subCategory = object;
                    return OnlineFormFeeRepository.deleteBySubCategoryId(subCategory.id)
                    .then(() => {
                        return subCategory;
                    });
                })
                .then(object => {
                    let subCategory = object;
                    let fee = new OnlineFormFeeModel();
                    fee.price = onlineFormSubCategory.price;
                    fee.subCategoryId = subCategory.id;
                    return OnlineFormFeeRepository.insert(fee)
                    .then(data => {
                        return OnlineFormFeeRepository.findOne(data.id);
                    })
                    .then(data => {
                        if (data === null) {
                            return Promise.reject(new ExceptionModel(
                                ErrorCode.RESOURCE.ONLINE_FORM_FEE_INVALID.CODE,
                                ErrorCode.RESOURCE.ONLINE_FORM_FEE_INVALID.MESSAGE,
                                false,
                                HttpStatus.BAD_REQUEST,
                            ));
                        }
                        return subCategory;
                    });
                })
                .then((object) => {
                    return OnlineFormSubCategoryRepository.findOne(object.id, related, filters);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * view online form sub category of condo. use for SA
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public viewOnlineFormSubCategoryById(id: string, related = [], filters = []): Promise<OnlineFormSubCategoryModel> {
        return OnlineFormSubCategoryRepository.findOne(id, related, filters)
            .then(object => {
                if (object) {
                    return object;
                } else {
                    return null;
                }
            });
    }

     /**
     * remove online form by sub category id of condo. use for SA
     * @param id
     * @param related
     * @param filters
     * @returns {Bluebird<boolean>}
     */
    public removeOnlineFormSubCategoryById(id: string, related = [], filters = []): Promise<boolean> {
        return OnlineFormSubCategoryRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    public countOnlineFormStatusByCondo() {
        return OnlineFormRequestItemsRepository.countOnlineFormStatusByCondo();
    }

    public setCounterOnlineForm(condoId: string, counter: number): Promise<any> {
        // Counter the new online form requesr, support for Condo Manager.
        let fb = FirebaseAdmin.getInstance();
        return Promise.resolve()
            .then(() => {
                return fb.database().ref("counter").child(`${condoId}`)
                    .update({
                        onlineForms: counter
                    })
                    .catch(err => Logger.error(err.message, err));
            }).catch(err => Logger.error(err.message, err));
    }

    public resetCounter() {
        return this.countOnlineFormStatusByCondo()
        .then(list => {
            return Promise.each(list, data => {
                return this.setCounterOnlineForm(data["condo_id"], parseInt(data["duecount"]));
            });
        });
    }

    public generateSerialNumber(onlineFormRequestItem: OnlineFormRequestItemsModel): string {
        let mcst = onlineFormRequestItem.condo.mcstNumber;
        let currentYear = new Date();
        let year = currentYear.getFullYear().toString().substring(2);
        let unitNumber = onlineFormRequestItem.unit.unitNumber;
        let firstName = onlineFormRequestItem.user.firstName.substring(0, 4).toUpperCase();
        return mcst + year + unitNumber + firstName;
    }
}

export default OnlineFormService;
