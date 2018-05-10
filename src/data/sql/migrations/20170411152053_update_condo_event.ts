import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

let whatOnView = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.WHAT_ON_VIEW_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.WHAT_ON_ID, 36).notNullable().index()
                    .references(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

let announcementView = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.ANNOUNCEMENT_ID, 36).notNullable().index()
                    .references(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        whatOnView(knex, promise),
        announcementView(knex, promise)
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.WHAT_ON_VIEW_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
