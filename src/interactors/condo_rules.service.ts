/**
 * Created by davidho on 2/18/17.
 */

import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, CondoRulesModel, ExceptionModel} from "../models";
import {CondoRulesRepository, CondoRepository} from "../data";
import {ErrorCode, HttpStatus} from "../libs/index";

export class CondoRulesService extends BaseService<CondoRulesModel, typeof CondoRulesRepository> {
    constructor() {
        super(CondoRulesRepository);
    }

    public create(condoRule: CondoRulesModel, related = [], filters = []): Promise<CondoRulesModel> {
        if (condoRule != null) {
            return CondoRepository.findOne(condoRule.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return CondoRulesRepository.insert(condoRule);
                })
                .then((object) => {
                    return CondoRulesRepository.findOne(object.id, related, filters);
                });
        }
        return Promise.resolve(null);
    }

    public update(condoRule: CondoRulesModel, related = [], filters = []): Promise<CondoRulesModel> {
        if (condoRule != null) {
            return CondoRepository.findOne(condoRule.condoId)
                .then(condo => {
                    if (condo === null || condo.isEnable === false) {
                        return Promise.reject(new ExceptionModel(
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                            ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));
                    }
                    return CondoRulesRepository.update(condoRule);
                })
                .then((object) => {
                    return CondoRulesRepository.findOne(object.id, related, filters);
                });

        }
        return Promise.resolve(null);
    }

    public removeById(id: string, related = [], filters = []): Promise<boolean> {
        return CondoRulesRepository.deleteLogic(id)
            .then(object => {
                if (object === null) {
                    return false;
                } else {
                    return true;
                }
            });
    }

    public search(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<CondoRulesModel>> {
        return CondoRulesRepository.search(searchParams, offset, limit, related, filters);
    }
}

export default CondoRulesService;
