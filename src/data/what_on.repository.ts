import * as Promise from "bluebird";
import {BaseRepository} from "./base.repository";
import {WhatOnDto} from "./sql/models";
import {WhatOnModel, BaseModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";

export class WhatOnRepository extends BaseRepository<WhatOnDto, WhatOnModel> {
    constructor() {
        super(WhatOnDto, WhatOnModel, {
            fromDto: WhatOnModel.fromDto,
            toDto: WhatOnModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related = [], filters = []): Promise<CollectionWrap<WhatOnModel>> {
        let keyword = searchParams.key;
        let condoId = searchParams.condoId;
        let isDeleted = searchParams.isDeleted;
        let isAdminCreate = searchParams.isAdminCreate;
        let startDate = searchParams.startDate;
        let endDate = searchParams.endDate;

        let isActive = searchParams.isActive;
        let isReport = searchParams.isReport;
        limit = limit || null;
        offset = offset || null;

        let currentDate = new Date().toISOString();
        let query = (offset?: number, limit?: number, isOrder?: boolean) => {
            return (q): void => {
                if (!isReport) {
                    q.where(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                }
                if (keyword) {
                    q.where(q1 => {
                        q1.where(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW, "ILIKE", `%${keyword}%`);
                    });
                }
                if (condoId) {
                    q.andWhere(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
                }
                if (isAdminCreate != null) {
                    q.andWhere(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_ADMIN_CREATE, isAdminCreate);
                }
                if (isActive) {
                    q.andWhere(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.EXPIRY_DATE, ">", new Date());
                }
                if (startDate) {
                    q.andWhere(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE_POST, ">=", startDate);
                }
                if (endDate) {
                    q.andWhere(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE_POST, "<=", endDate);
                }
                if (offset) {
                    q.offset(offset);
                }
                if (limit) {
                    q.limit(limit);
                }
                if (isOrder) {
                    if (startDate || endDate) {
                        q.orderBy(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE_POST, "ASC");
                    } else {
                        q.orderBy(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE_POST, "DESC");
                    }
                }
            };
        };

        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export  default WhatOnRepository;
