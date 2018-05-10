/**
 * Created by ducbaovn on 24/07/17.
 */

import {BaseRepository} from "./base.repository";
import {NotificationDto} from "./sql/models";
import {NotificationModel, CollectionWrap} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class NotificationRepository extends BaseRepository<NotificationDto, NotificationModel> {
    constructor() {
        super(NotificationDto, NotificationModel, {
            fromDto: NotificationModel.fromDto,
            toDto: NotificationModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<NotificationModel>> {
        let keyword = searchParams.key || null;
        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q) => {
                q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (keyword !== null) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.BODY, "ILIKE", `%${keyword}%`);
                    q.orWhere(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TITLE, "ILIKE", `%${keyword}%`);
                }
                if (searchParams.id) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ID, searchParams.id);
                }
                if (searchParams.userId) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.USER_ID, searchParams.userId);
                }
                if (searchParams.clickAction) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CLICK_ACTION, searchParams.clickAction);
                }
                if (searchParams.type) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TYPE, searchParams.type);
                }
                if (searchParams.groupType) {
                    q.where(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.GROUP_TYPE, searchParams.groupType);
                }
                if (limit !== null) {
                    q.limit(limit);
                }
                if (offset !== null) {
                    q.offset(offset);
                }
                if (isOrderBy) {
                    q.orderBy(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CREATED_DATE, "DESC");
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default NotificationRepository;
