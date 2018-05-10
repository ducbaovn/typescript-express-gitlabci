import {BaseRepository} from "./base.repository";
import {CondoSecurityDto} from "./sql/models";
import {CondoSecurityModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class CondoSecurityRepository extends BaseRepository<CondoSecurityDto, CondoSecurityModel> {
    constructor() {
        super(CondoSecurityDto, CondoSecurityModel, {
            fromDto: CondoSecurityModel.fromDto,
            toDto: CondoSecurityModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<CondoSecurityModel>> {
        let keyword = searchParams.key || null;
        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q) => {
                q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
                q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
                q.innerJoin(Schema.USER_TABLE_SCHEMA.TABLE_NAME, `${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID}`, `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.ID}`);
                q.innerJoin(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID}`, `${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID}`);
                if (keyword !== null) {
                    q.where(q1 => {
                        q1.where(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.LAST_NAME}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}`, "ILIKE", `%${keyword}%`);
                        q1.orWhere(`${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME}`, "ILIKE", `%${keyword}%`);
                    });
                }
                if (searchParams.id) {
                    q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.ID}`, searchParams.id);
                }
                if (searchParams.condoId) {
                    q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID}`, searchParams.condoId);
                }
                if (searchParams.userId) {
                    q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID}`, searchParams.userId);
                }
                if (limit !== null) {
                    q.limit(limit);
                }
                if (offset !== null) {
                    q.offset(offset);
                }
                if (isOrderBy) {
                    let orderBy = searchParams.orderBy || `${Schema.USER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_TABLE_SCHEMA.FIELDS.FIRST_NAME}`;
                    let orderType = searchParams.orderType || "ASC";
                    q.orderByRaw(`lower(${orderBy}) ${orderType}`);
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default CondoSecurityRepository;
