import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

let initTable = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.ADVERTISER_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.BUSINESS_NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.CONTACT_NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.PHONE_NUMBER, 50).notNullable();
                table.string(SCHEMA.FIELDS.MOBILE_NUMBER, 50).notNullable();
                table.string(SCHEMA.FIELDS.EMAIL, 255).notNullable();
                table.string(SCHEMA.FIELDS.WEBSITE, 255).nullable();
                table.string(SCHEMA.FIELDS.ADDRESS_LINE_1, 255).nullable();
                table.string(SCHEMA.FIELDS.ADDRESS_LINE_2, 255).nullable();
                table.string(SCHEMA.FIELDS.POSTAL_CODE, 20).nullable();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        initTable(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE ${Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
