import {BaseRepository} from "./base.repository";
import {RoleDto} from "./sql/models";
import {RoleModel} from "../models";
/**
 * Created by kiettv on 1/3/17.
 */
export class RoleRepository extends BaseRepository<RoleDto, RoleModel> {
    constructor() {
        super(RoleDto, RoleModel, {
            fromDto: RoleModel.fromDto,
            toDto: RoleModel.toDto,
        });
    }
}
export  default RoleRepository;
