import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`DROP TABLE IF EXISTS ${Schema.PHONE_NUMBER_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
