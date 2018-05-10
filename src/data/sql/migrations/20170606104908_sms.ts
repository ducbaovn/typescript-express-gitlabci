import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { SMS_TYPE } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(Schema.SMS_TABLE_SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.SMS_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.SMS_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE).notNullable().defaultTo(SMS_TYPE.OTP);
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.TO).notNullable();
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID).nullable();
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID).nullable();
                table.string(Schema.SMS_TABLE_SCHEMA.FIELDS.SMS_ID).notNullable();
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.dropTable(Schema.SMS_TABLE_SCHEMA.TABLE_NAME);
        });
};