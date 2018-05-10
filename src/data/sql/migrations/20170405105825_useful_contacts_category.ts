import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

let initCategory = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA;

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

                table.text(SCHEMA.FIELDS.CONDO_ID).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.text(SCHEMA.FIELDS.NAME).notNullable();
                table.string(SCHEMA.FIELDS.ICON_URL, 255).nullable();
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        initCategory(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
