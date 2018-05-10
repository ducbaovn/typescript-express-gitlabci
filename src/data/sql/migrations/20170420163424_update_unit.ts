import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME} RENAME COLUMN ${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMER} TO ${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER}`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME} RENAME COLUMN ${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER} TO ${Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMER}`);
        });
};
