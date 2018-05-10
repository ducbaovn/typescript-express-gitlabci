import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`ALTER TABLE ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN IF EXISTS TITLE`);
        })
        .then(() => {
            return knex.schema.raw(`ALTER TABLE ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN IF EXISTS TITLE`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
