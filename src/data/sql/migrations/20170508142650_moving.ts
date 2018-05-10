import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.MOVING_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.MOVING_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.MOVING_TABLE_SCHEMA.FIELDS.START_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.TYPE, 15).notNullable();
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.BLOCK_ID, 36).notNullable();
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.UNIT_ID, 36).notNullable();
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.FIRST_NAME, 255);
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.LAST_NAME, 255);
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.USER_ROLE, 255);
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.EMAIL, 255);
            table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.PHONE_NUMBER, 63);
            table.boolean(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_DEPOSIT).notNullable().defaultTo(0);
            table.boolean(Schema.MOVING_TABLE_SCHEMA.FIELDS.IS_LIFT_PADDING).notNullable().defaultTo(0);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME);
    });
};