import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.PHONE_NUMBER} DROP NOT NULL`);
    })
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.MOBILE} DROP NOT NULL`);
    })
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EMAIL} DROP NOT NULL`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};