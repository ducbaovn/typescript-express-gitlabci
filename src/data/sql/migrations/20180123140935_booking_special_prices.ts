import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.BOOKING_SPECIAL_PRICES.TABLE_NAME, (table => {
            table.string(Schema.BOOKING_SPECIAL_PRICES.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.BOOKING_SPECIAL_PRICES.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.BOOKING_SPECIAL_PRICES.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.BOOKING_SPECIAL_PRICES.FIELDS.SLOT_ID, 36).notNullable().index()
            .references(Schema.SLOT_TABLE_SCHEMA.FIELDS.ID)
            .inTable(Schema.SLOT_TABLE_SCHEMA.TABLE_NAME)
            .onUpdate("CASCADE")
            .onDelete("CASCADE");

            table.string(Schema.BOOKING_SPECIAL_PRICES.FIELDS.FACILITY_ID, 36).notNullable();
            table.string(Schema.BOOKING_SPECIAL_PRICES.FIELDS.TYPE);
            table.specificType(Schema.BOOKING_SPECIAL_PRICES.FIELDS.CONDITION, "text[]").notNullable();
            table.float(Schema.BOOKING_SPECIAL_PRICES.FIELDS.PAYMENT_AMOUNT).defaultTo(0.0);
            table.float(Schema.BOOKING_SPECIAL_PRICES.FIELDS.DEPOSIT_AMOUNT).defaultTo(0.0);
            table.integer(Schema.BOOKING_SPECIAL_PRICES.FIELDS.PRIORITY).notNullable().defaultTo(0);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.BOOKING_SPECIAL_PRICES.TABLE_NAME);
    });
};