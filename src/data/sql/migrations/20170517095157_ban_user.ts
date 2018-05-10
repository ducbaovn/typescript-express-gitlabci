import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.TYPE, 255).notNullable();

                table.string(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.text(Schema.BAN_USER_TABLE_SCHEMA.FIELDS.REASON).nullable();
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.dropTable(Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME);
        });
};
