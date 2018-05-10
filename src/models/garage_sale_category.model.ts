/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {GarageSaleCategoryDto} from "../data/sql/models";

export class GarageSaleCategoryModel extends BaseModel {
    public name: string;
    public priority: number;

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {GarageSaleCategoryModel}
     */
    public static fromDto(dto: GarageSaleCategoryDto, filters: string[] = []): GarageSaleCategoryModel {
        let model: GarageSaleCategoryModel = null;
        if (dto != null) {
            model = new GarageSaleCategoryModel();
            model.id = BaseModel.getString(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.name = BaseModel.getString(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.NAME));
            model.priority = BaseModel.getNumber(dto.get(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY));
        }
        GarageSaleCategoryModel.filter(model, filters);
        return model;
    }

    /**
     * Convert model to entity
     * @param model
     * @returns {{}}
     */
    public static toDto(model: GarageSaleCategoryModel): any {
        let dto = {};


        return dto;
    }
}

export default GarageSaleCategoryModel;
