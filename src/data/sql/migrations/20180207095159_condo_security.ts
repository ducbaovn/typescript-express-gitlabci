import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

exports.up = function (knex, Promise) {
    return Promise.resolve()
    .then(() => {
        let SCHEMA = Schema.CONDO_SECURITY_TABLE_SCHEMA;
        return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
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

            table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO roles (id, is_deleted, is_enable, created_date, updated_date, name, description)
            VALUES ('condo_security', false, true, now(), now(), 'Condo Security', 'Condo Security Role');
        `);
    });
};

exports.down = function (knex, Promise) {
    return Promise.resolve()
    .then(() => {
        return knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
    })
    .then(() => {
        knex.raw(`
            DELETE FROM roles WHERE id = 'condo_security' CASCADE;
        `);
    });
};
