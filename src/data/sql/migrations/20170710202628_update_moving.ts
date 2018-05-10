import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID).notNullable();
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.CONTRACT_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONDO_ID).notNullable();
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.CONTRACT_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.CONTRACT_TABLE_SCHEMA.FIELDS.CONDO_ID);
            }));
        });
};