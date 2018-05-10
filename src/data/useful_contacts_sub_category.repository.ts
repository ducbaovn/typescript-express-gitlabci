/**
 * Created by thanhphan on 4/5/17.
 */
import {BaseRepository} from "./base.repository";
import {UsefulContactsSubCategoryDto} from "./sql/models";
import {UsefulContactsSubCategoryModel} from "../models";

export class UsefulContactsSubCategoryRepository extends BaseRepository<UsefulContactsSubCategoryDto, UsefulContactsSubCategoryModel> {
    constructor() {
        super(UsefulContactsSubCategoryDto, UsefulContactsSubCategoryModel, {
            fromDto: UsefulContactsSubCategoryModel.fromDto,
            toDto: UsefulContactsSubCategoryModel.toDto,
        });
    }
}

export default UsefulContactsSubCategoryRepository;
