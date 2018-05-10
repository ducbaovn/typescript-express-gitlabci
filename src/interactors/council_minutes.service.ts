/**
 * Created by davidho on 2/20/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, CouncilMinutesModel} from "../models";
import {CouncilMinutesRepository, CondoRepository} from "../data";
import {ExceptionModel} from "../models";
import {ErrorCode, HttpStatus} from "../libs/index";

export class CouncilMinutesService extends BaseService<CouncilMinutesModel, typeof CouncilMinutesRepository > {
    constructor() {
        super(CouncilMinutesRepository);
    }

    public create(councilMinutes: CouncilMinutesModel, related = [], filters = []): Promise<CouncilMinutesModel> {
        if (councilMinutes != null) {
            return CondoRepository.findOne(councilMinutes.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return CouncilMinutesRepository.insert(councilMinutes);
                })
                .then((object) => {
                    return CouncilMinutesRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    public update(councilMinutes: CouncilMinutesModel, related = [], filters = []): Promise<CouncilMinutesModel> {
        if (councilMinutes != null) {
            return CondoRepository.findOne(councilMinutes.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return CouncilMinutesRepository.update(councilMinutes);
                })
                .then((object) => {
                    return CouncilMinutesRepository.findOne(object.id, related, filters);
                });

        }
        return Promise.resolve(null);
    }

    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        return CouncilMinutesRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<CouncilMinutesModel>> {
        return CouncilMinutesRepository.search(searchParams, offset, limit, related, filters);
    }
}

export default CouncilMinutesService;
