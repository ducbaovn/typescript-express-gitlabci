import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {FacilityTypeDto} from "../data/sql/models";

export class FacilityTypeModel extends BaseModel {
    public name: string;
    public priority: number;
    public desc: string;

    public static toResponse(modal: FacilityTypeModel): any {

    }

    public static fromRequest(data: any): FacilityTypeModel {
        let model: FacilityTypeModel = new FacilityTypeModel();

        if (data != null) {
            model.name = BaseModel.getString(data.name);
            model.priority = BaseModel.getNumber(data.priority);
            model.desc = BaseModel.getString(data.desc);
            model.isEnable = BaseModel.getBoolean(data.isEnable, true);
            model.isDeleted = BaseModel.getBoolean(data.isDeleted, false);
        }

        return model;
    }

    public static fromDto(dto: FacilityTypeDto, filters = []): FacilityTypeModel {
        let model: FacilityTypeModel = null;

        if (dto != null) {
            model = new FacilityTypeModel();

            model.id = BaseModel.getString(dto.get(Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.ID));
            model.name = BaseModel.getString(dto.get(Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.NAME));
            model.priority = BaseModel.getNumber(dto.get(Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.PRIORITY));
            model.desc = BaseModel.getString(dto.get(Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.DESCRIPTION));
        }

        return model;
    }

    public static toDto(model: FacilityTypeModel): any {
        let dto = {};

        if (model != null) {
            if (model.id != null) {
                dto[Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.ID] = model.id;
            }

            if (model.name != null) {
                dto[Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.NAME] = model.name;
            }

            if (model.priority != null) {
                dto[Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.PRIORITY] = model.priority;
            }

            if (model.desc != null) {
                dto[Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = model.desc;
            }

            if (model.isDeleted != null) {
                dto[Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
            }
        }

        return dto;
    }
}

export default FacilityTypeModel;
