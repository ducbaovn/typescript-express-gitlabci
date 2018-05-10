/**
 * Created by kiettv on 1/3/17.
 */
import {BaseService} from "./base.service";
import {RoleModel} from "../models";
import {RoleRepository} from "../data";
import * as Promise from "bluebird";
export class RoleService extends BaseService<RoleModel, typeof RoleRepository> {
    constructor() {
        super(RoleRepository);
    }

    /**
     *
     * @param id
     * @param related
     * @param filters
     * @returns {Promise<RoleModel>}
     */
    public findById(id: string, related = [], filters = []): Promise<RoleModel> {
        return RoleRepository.findOne(id, related, filters);
    }
}

export default RoleService;
