import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(Schema.USER_SETTING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHAT).notNullable().defaultTo(1);
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_GARAGE_SALE).notNullable().defaultTo(1);
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_CHATTERBOX).notNullable().defaultTo(1);
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_FIND_A_BUDDY).notNullable().defaultTo(1);

                table.string(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.dropTable(Schema.USER_SETTING_TABLE_SCHEMA.TABLE_NAME);
        });
};
