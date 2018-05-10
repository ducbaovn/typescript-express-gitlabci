import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { SMS_TYPE } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.EMAIL_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.EMAIL_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE).nullable();
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.TO).notNullable();
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID).nullable();
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID).nullable();
                table.string(Schema.EMAIL_TABLE_SCHEMA.FIELDS.PARTNER_ID).notNullable();
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.dropTable(Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME);
        });
};