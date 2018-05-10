/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {AnnouncementUnitDto} from "./sql/models";
import {AnnouncementUnitModel, AnnouncementModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {ROLE} from "../libs/constants";


export class AnnouncementUnitRepository extends BaseRepository<AnnouncementUnitDto, AnnouncementUnitModel> {
    constructor() {
        super(AnnouncementUnitDto, AnnouncementUnitModel, {
            fromDto: AnnouncementUnitModel.fromDto,
            toDto: AnnouncementUnitModel.toDto,
        });
    }

    public generate(announcementModel: AnnouncementModel, unitId: string, isResidenceOwners: boolean, isResidenceTenants: boolean, isNonResidence: boolean): Promise<any> {
        if (isResidenceOwners && !isResidenceTenants && !isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.OWNER;
            announcementUnit.isResident = true;
            return this.insert(announcementUnit);
        }
        else if (!isResidenceOwners && isResidenceTenants && !isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.TENANT;
            announcementUnit.isResident = true;
            return this.insert(announcementUnit);
        }
        else if (!isResidenceOwners && !isResidenceTenants && isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.OWNER;
            announcementUnit.isResident = false;
            return this.insert(announcementUnit)
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            });
        }
        else if (isResidenceOwners && isResidenceTenants && !isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.OWNER;
            announcementUnit.isResident = true;
            return this.insert(announcementUnit)
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = true;
                return this.insert(announcementUnit);
            });
        }
        else if (isResidenceOwners && !isResidenceTenants && isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.OWNER;
            announcementUnit.isResident = true;
            return this.insert(announcementUnit)
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.OWNER;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            })
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            });
        }
        else if (!isResidenceOwners && isResidenceTenants && isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.TENANT;
            announcementUnit.isResident = true;
            return this.insert(announcementUnit)
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.OWNER;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            })
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            });
        }
        else if (isResidenceOwners && isResidenceTenants && isNonResidence) {
            let announcementUnit = new AnnouncementUnitModel();
            announcementUnit.announcementId = announcementModel.id;
            announcementUnit.unitId = unitId;
            announcementUnit.roleId = ROLE.OWNER;
            announcementUnit.isResident = false;
            return this.insert(announcementUnit)
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = false;
                return this.insert(announcementUnit);
            })
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.OWNER;
                announcementUnit.isResident = true;
                return this.insert(announcementUnit);
            })
            .then(() => {
                let announcementUnit = new AnnouncementUnitModel();
                announcementUnit.announcementId = announcementModel.id;
                announcementUnit.unitId = unitId;
                announcementUnit.roleId = ROLE.TENANT;
                announcementUnit.isResident = true;
                return this.insert(announcementUnit);
            });
        }
    }
}
export  default AnnouncementUnitRepository;
