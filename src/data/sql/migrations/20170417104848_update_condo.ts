import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.LATITUDE} DROP NOT NULL`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.LONGITUDE} DROP NOT NULL`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.COUNTRY} SET DEFAULT 'Singapore'`);
        })
        .then(result => {
            return knex.raw(`UPDATE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} SET ${Schema.CONDO_TABLE_SCHEMA.FIELDS.COUNTRY} = 'Singapore'`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ADD COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER} VARCHAR(30)`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ADD COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.TIMEZONE} VARCHAR(50) NOT NULL DEFAULT 'Asia/Singapore'`);
        })
        .then(result => {
            return knex.raw(`UPDATE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} SET ${Schema.CONDO_TABLE_SCHEMA.FIELDS.TIMEZONE} = 'Asia/Singapore'`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.LATITUDE} SET NOT NULL`);
        })
        .then((result) => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.LONGITUDE} SET NOT NULL`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.COUNTRY} DROP DEFAULT`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER}`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN ${Schema.CONDO_TABLE_SCHEMA.FIELDS.TIMEZONE}`);
        });
};
