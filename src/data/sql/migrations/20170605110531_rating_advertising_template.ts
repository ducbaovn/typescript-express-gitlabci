import * as Bluebird from "bluebird";
import * as Knex from "knex";
import {ADVERTISING_TEMPLATE_TABLE_SCHEMA, RATING_ADVERTISING_TEMPLATE_SCHEMA, USER_TABLE_SCHEMA} from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${RATING_ADVERTISING_TEMPLATE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(RATING_ADVERTISING_TEMPLATE_SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.USER_ID).notNullable().index()
                    .references(USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.string(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID).notNullable()
                    .references(ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.integer(RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.RATING_VALUE).notNullable();
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${RATING_ADVERTISING_TEMPLATE_SCHEMA.TABLE_NAME} CASCADE`);
        });
};