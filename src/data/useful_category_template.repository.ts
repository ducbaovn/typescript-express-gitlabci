/**
 * Created by thanhphan on 4/5/17.
 */
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {BaseRepository} from "./base.repository";
import {UsefulCategoryTemplateDto} from "./sql/models";
import {UsefulCategoryTemplateModel} from "../models/useful_category_template.model";

export class UsefulCategoryTemplateRepository extends BaseRepository<UsefulCategoryTemplateDto, UsefulCategoryTemplateModel> {
    constructor() {
        super(UsefulCategoryTemplateDto, UsefulCategoryTemplateModel, {
            fromDto: UsefulCategoryTemplateModel.fromDto,
            toDto: UsefulCategoryTemplateModel.toDto,
        });
    }

    /**
     * Get all category default with priority.
     *
     * @returns {Promise<UsefulCategoryTemplateModel[]>}
     */
    public getCategoryTemplate(): Promise<UsefulCategoryTemplateModel[]> {
        return this.findByQuery(q => {
            q.orderBy(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        });
    }
}

export default UsefulCategoryTemplateRepository;
