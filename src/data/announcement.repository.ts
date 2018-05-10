/**
 * Created by davidho on 2/12/17.
 */

import {BaseRepository} from "./base.repository";
import {AnnouncementDto} from "./sql/models";
import {AnnouncementModel, BaseModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
import {CollectionWrap} from "../models/collections";
import {DELETE_STATUS, ENABLE_STATUS, STATUS_REQUEST_USER} from "../libs/constants";
import Redis from "../data/redis/redis";

export class AnnouncementRepository extends BaseRepository<AnnouncementDto, AnnouncementModel> {
    constructor() {
        super(AnnouncementDto, AnnouncementModel, {
            fromDto: AnnouncementModel.fromDto,
            toDto: AnnouncementModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<AnnouncementModel>> {
        let keyword = searchParams.key;
        let condoId = searchParams.condoId;
        let unitId = searchParams.unitId;
        let roleId = searchParams.roleId;
        let isResident = searchParams.isResident;

        let startDate = searchParams.startDate;
        let endDate = searchParams.endDate;

        let isActive = searchParams.isActive;
        let isReport = searchParams.isReport;

        limit = limit;
        offset = offset;

        let currentDate = new Date().toISOString();

        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (searchParams.key) {
                    q.where(q1 => {
                        q1.where(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId) {
                    q.andWhere(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CONDO_ID}`, condoId);
                }
                if (!isReport) {
                    q.andWhere(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                }
                if (startDate) {
                    q.andWhere(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST}`, ">=", startDate);
                }
                if (endDate) {
                    q.andWhere(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST}`, "<=", endDate);
                }
                if (isActive) {
                    q.andWhere(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.EXPIRY_DATE}`, ">", currentDate);
                }

                // Not display expired record on mobile
                if (unitId || roleId || isResident != null) {
                    q.innerJoin(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME,
                        `${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID}`,
                        `${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID}`);
                    if (unitId) {
                        q.andWhere(`${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}`, unitId);
                    }
                    if (roleId) {
                        q.andWhere(`${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID}`, roleId);
                    }
                    if (isResident != null) {
                        q.andWhere(`${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}`, isResident);
                    }
                }
                if (offset) {
                    q.offset(offset);
                }
                if (limit) {
                    q.limit(limit);
                }
                if (isOrder) {
                    if (startDate || endDate) {
                        q.orderBy(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST}`, "ASC");
                    } else {
                        q.orderBy(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.DATE_POST}`, "DESC");
                    }
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export  default AnnouncementRepository;
