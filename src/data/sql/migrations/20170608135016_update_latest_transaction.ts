import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.schema.createTable(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.TABLE_NAME, (table) => {
            table.string(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.dateTime(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE).notNullable();
            table.string(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.BLOCK).notNullable();
            table.string(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.UNIT_NUMBER).notNullable();
            table.decimal(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.SIZE, 8, 3).notNullable().defaultTo(0);
            table.decimal(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PRICE, 8, 3).notNullable().defaultTo(0);
            table.decimal(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.PSF, 8, 3).nullable();
            table.string(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE).notNullable();
        });
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};