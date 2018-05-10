import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.NAME, 255).notNullable();
        }));
    })
    .then(() => {
        return knex.schema.createTable(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID, 36).notNullable();
            table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID, 36).notNullable();
            table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.PHONE_NUMBER, 255).notNullable();
            table.dateTime(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EXPIRY_DATE).notNullable();
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.schema.dropTable(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME);
    });
};