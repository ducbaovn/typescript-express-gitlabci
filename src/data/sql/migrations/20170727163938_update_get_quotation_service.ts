import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.MOBILE).notNullable().defaultTo("");
                table.string(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EMAIL).notNullable().defaultTo("");
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.MOBILE);
                table.dropColumn(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EMAIL);
            }));
        });
};