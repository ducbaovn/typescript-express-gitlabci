import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.NEW_USER, 255);
            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.DEPOSIT, 255);
            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.ONLINE_FORM, 255);
            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.BOOKING, 255);
            table.string(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.UNIT_LOG, 255);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.TABLE_NAME);
    });
};