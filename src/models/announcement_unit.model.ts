/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import { BaseModel } from "./base.model";
import { UnitModel } from "./unit.model";
import {AnnouncementUnitDto, UnitDto} from "../data/sql/models";

export class AnnouncementUnitModel extends BaseModel {
    public unitId: string;
    public announcementId: string;
    public roleId: string;
    public isResident: boolean;

    public unit: UnitModel;

    /**
     *
     * @param dto
     * @param filters
     * @returns {BanUserModel}
     */
    public static fromDto(dto: AnnouncementUnitDto, filters: string[] = []): AnnouncementUnitModel {
        let model: AnnouncementUnitModel = null;

        if (dto != null) {
            model = new AnnouncementUnitModel();
            model.id = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE));
            model.announcementId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID));
            model.unitId = BaseModel.getString(dto.get(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID));

            let unitRelation: UnitDto = dto.related("unit") as UnitDto;

            if (unitRelation != null && unitRelation.id != null) {
                let unitModel = UnitModel.fromDto(unitRelation, [...filters]);
                if (unitModel != null) {
                    model.unit = unitModel;
                }
            }

        }

        AnnouncementUnitModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {BanUserModel}
     */
    public static fromRequest(req: express.Request): AnnouncementUnitModel {
        let ret = new AnnouncementUnitModel();

        if (req != null && req.body != null) {
            ret.announcementId = this.getString(req.body.announcementId);
            ret.unitId = this.getString(req.body.unitId);
            ret.roleId = this.getString(req.body.roleId);
            ret.isResident = this.getBoolean(req.body.isResident);
        }

        return ret;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: AnnouncementUnitModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.unitId != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
        }

        if (model.announcementId != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID] = model.announcementId;
        }

        if (model.roleId != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID] = model.roleId;
        }

        if (model.isResident != null) {
            dto[Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT] = model.isResident;
        }

        return dto;
    }
}

export default AnnouncementUnitModel;
