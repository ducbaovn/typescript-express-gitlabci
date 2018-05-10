import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

exports.up = function (knex, Promise) {
    return Promise.resolve()
    .then(() => {
        let SCHEMA = Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA;
        return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
            table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(SCHEMA.FIELDS.SLOT_ID, 36).notNullable().index()
                .references(Schema.SLOT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.SLOT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(SCHEMA.FIELDS.PARTNER_SLOT_ID, 36).notNullable().index()
                .references(Schema.SLOT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.SLOT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.unique([SCHEMA.FIELDS.SLOT_ID, SCHEMA.FIELDS.PARTNER_SLOT_ID]);
        });
    });
};

exports.down = function (knex, Promise) {
    return Promise.resolve()
    .then(() => {
        return knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
    });
};
