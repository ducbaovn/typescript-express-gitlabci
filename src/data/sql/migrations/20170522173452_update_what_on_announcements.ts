import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.PHONE} DROP NOT NULL`);
        })
        .then(result => {
            return knex.raw(`ALTER TABLE ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.PHONE} DROP NOT NULL`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.PHONE} SET NOT NULL`);
        })
        .then((result) => {
            return knex.raw(`ALTER TABLE ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.PHONE} DROP NOT NULL`);
        });
};
