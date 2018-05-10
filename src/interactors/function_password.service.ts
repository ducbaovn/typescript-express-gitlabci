import * as Promise from "bluebird";
import {BaseService} from "./base.service";
import {CollectionWrap, FunctionPasswordModel, ExceptionModel} from "../models";
import {FunctionPasswordRepository} from "../data";
import { UserService } from "./index";

export class FunctionPasswordService extends BaseService<FunctionPasswordModel, typeof FunctionPasswordRepository> {
    constructor() {
        super(FunctionPasswordRepository);
    }

    public getPassword(managerId: string, functionPasswordType: string): Promise<string> {
        return UserService.findOne(managerId, ["condoManager.functionPassword"])
        .then(user => {
            if (!user.condoManager || !user.condoManager.functionPassword) {
                return null;
            }
            return user.condoManager.functionPassword[functionPasswordType];
        });
    }
}

export default FunctionPasswordService;
