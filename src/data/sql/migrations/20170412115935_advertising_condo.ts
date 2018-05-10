import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

let initTable = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.ADVERTISING_CONDO_TABLE_SCHEMA;

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

                table.string(SCHEMA.FIELDS.ADVERTISER_ID, 36).index()
                    .references(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.CATEGORY_ID, 36).index()
                    .references(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.SUB_CATEGORY_ID, 36).index()
                    .references(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.TEMPLATE_ID, 36).notNullable().index()
                    .references(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.integer(SCHEMA.FIELDS.FREQUENCY).nullable();
                table.date(SCHEMA.FIELDS.EXPIRY_DATE).nullable();
                table.boolean(SCHEMA.FIELDS.IS_EXPIRED).notNullable().defaultTo(0);
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
        knex.schema.raw(`DROP TABLE ${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
