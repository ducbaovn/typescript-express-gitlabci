/**
 * Created by thanhphan on 4/12/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import {AdvertisingImageDto} from "../data/sql/models";
import {AdvertisingTemplateModel} from "./advertising_template.model";
import {BaseModel} from "./base.model";

export class AdvertisingImageModel extends BaseModel {
    public templateId: string;
    public imageUrl: string;
    public imageName: string;
    public advertisingTemplate?: AdvertisingTemplateModel;

    /**
     * Convert to model from data object into request.
     * @param req
     * @returns {AdvertisingImageModel}
     */
    public static fromRequest(req: express.Request): AdvertisingImageModel {
        let ret = new AdvertisingImageModel();

        if (req != null && req.body != null) {
            ret.templateId = this.getString(req.body.templateId);
            ret.imageUrl = this.getString(req.body.imageUrl);
            ret.imageName = this.getString(req.body.imageName);
        }

        return ret;
    }

    /**
     * Make model default.
     *
     * @param data
     * @returns {AdvertisingImageModel}
     */
    public static makeModel(data: any = {}): AdvertisingImageModel {
        let ret = new AdvertisingImageModel();

        if (data != null) {
            if (data.id != null) {
                ret.id = data.id;
            }

            if (data.templateId != null) {
                ret.templateId = data.templateId;
            }

            if (data.imageUrl != null) {
                ret.imageUrl = data.imageUrl;
            }

            if (data.imageName != null) {
                ret.imageName = data.imageName;
            }
        } else {
            ret = null;
        }

        return ret;
    }

    /**
     * Convert entity to model.
     * @param dto
     * @param filters
     * @returns {AdvertisingImageModel}
     */
    public static fromDto(dto: AdvertisingImageDto, filters = []): AdvertisingImageModel {
        let model: AdvertisingImageModel = null;

        if (dto != null) {
            model = new AdvertisingImageModel();

            model.id = BaseModel.getString(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.ID));
            // model.createdDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            // model.updatedDate = BaseModel.getDate(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.templateId = BaseModel.getString(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.TEMPLATE_ID));
            model.imageUrl = BaseModel.getString(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.imageName = BaseModel.getString(dto.get(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_NAME));

            // Mapping with all pictures inside the template.
            let templateRelation: any = dto.related("advertisingTemplate");

            if (templateRelation != null && templateRelation.id != null) {
                model.advertisingTemplate = AdvertisingTemplateModel.fromDto(templateRelation, filters);
            }

            if (filters != null && filters.length > 0) {
                AdvertisingImageModel.filter(model, filters);
            }
        }

        return model;
    }

    /**
     * Convert model to entity.
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AdvertisingImageModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.templateId != null) {
            dto[Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.TEMPLATE_ID] = model.templateId;
        }

        if (model.imageUrl != null) {
            dto[Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.imageUrl;
        }

        if (model.imageName != null) {
            dto[Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_NAME] = model.imageName;
        }

        return dto;
    }
}

export default AdvertisingImageModel;
