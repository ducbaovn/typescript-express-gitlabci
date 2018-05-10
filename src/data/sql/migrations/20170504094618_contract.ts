import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { STATUS_CONTRACT } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.CONTRACT_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TYPE, 255).notNullable();
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.STATUS, 255).notNullable().defaultTo(STATUS_CONTRACT.LIVE);
            table.dateTime(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.START_DATE).notNullable();
            table.dateTime(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.END_DATE).notNullable();
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.VENDOR_NAME, 255).notNullable();
            table.integer(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.AMOUNT).notNullable();
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONTRACT_DOCUMENT, 255);
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER1_DOCUMENT, 255);
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER2_DOCUMENT, 255);
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER3_DOCUMENT, 255);
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER4_DOCUMENT, 255);
            table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.TENDER5_DOCUMENT, 255);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.CONTRACT_TABLE_SCHEMA.TABLE_NAME);
    });
};