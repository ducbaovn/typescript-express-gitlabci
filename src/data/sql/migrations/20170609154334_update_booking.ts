import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.boolean(Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAY_BY_CASH).notNullable().defaultTo(0);
            });
        })
        .then(() => {
            return knex.schema.table(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.boolean(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.PAY_BY_CASH).notNullable().defaultTo(0);
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAY_BY_CASH);
            });
        })
        .then(() => {
            return knex.schema.table(Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAY_BY_CASH);
            });
        });
};