import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID, 36).notNullable().index()
                .references(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.TABLE_NAME);
    });
};