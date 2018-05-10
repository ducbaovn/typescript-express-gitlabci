/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {ExceptionModel, CollectionWrap, AdvertiserModel} from "../models";
import {
    AdvertiserRepository
} from "../data";
import {HttpStatus} from "../libs/index";
import {ErrorCode} from "../libs/error_code";

export class AdvertiserService extends BaseService<AdvertiserModel, typeof AdvertiserRepository> {
    constructor() {
        super(AdvertiserRepository);
    }

    /**
     * Get list advertiser in the iCondo network.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {any}
     */
    public getAllAdvertisers(searchParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertiserModel>> {
        return AdvertiserRepository.getAllAdvertisers(searchParams, offset, limit, related, filters);
    }

    /**
     * Get list partner by sub-category.
     *
     * @param searchParams
     * @param offset
     * @param limit
     * @param related
     * @param filters
     * @returns {Promise<CollectionWrap<AdvertiserModel>>}
     */
    public getListPartners(searchParams: any = {}, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<AdvertiserModel>> {
        return AdvertiserRepository.getListPartners(searchParams, offset, limit, related, filters);
    }

    /**
     * Get advertiser detail by id.
     *
     * @param advertiserId
     * @param related
     * @param filters
     * @returns {Promise<AdvertiserModel>}
     */
    public getAdvertiserDetail(advertiserId: string, related = [], filters = []): Promise<AdvertiserModel> {
        return AdvertiserRepository.findOne(advertiserId, related, filters);
    }

    /**
     * Function create new advertiser.
     *
     * @param dataModel
     * @returns {any}
     */
    public createAdvertiser(dataModel: AdvertiserModel): Promise<AdvertiserModel> {
        if (dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    // Noted: Currently not constraint unique advertiser. Maybe will be changed in the future.
                    // return AdvertiserRepository.getAdvertiserBy(null, dataModel.email);
                    return AdvertiserRepository.insert(dataModel);
                })
                .then(result => {
                    return AdvertiserModel.fromDto(result);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Update advertiser info.
     *
     * @param advertiserId
     * @param dataModel
     * @returns {any}
     */
    public updateAdvertiser(advertiserId: string, dataModel: AdvertiserModel): Promise<AdvertiserModel> {
        if (advertiserId != null && dataModel != null) {
            return Promise.resolve()
                .then(() => {
                    return AdvertiserRepository.getAdvertiserBy(advertiserId);
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
                        dataModel.id = advertiserId;

                        return AdvertiserRepository.update(dataModel);
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
     * Delete advertiser by id.
     *
     * @param advertiserId
     * @returns {any}
     */
    public deleteAdvertiser(advertiserId: string): Promise<any> {
        if (advertiserId != null && advertiserId !== "") {
            return Promise.resolve()
                .then(() => {
                    return AdvertiserRepository.findOne(advertiserId);
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
                        return AdvertiserRepository.deleteLogic(advertiserId);
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
}

export default AdvertiserService;
