import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.EXPIRY_DATE} = now()
            WHERE ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_ENABLE} = false AND ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.EXPIRY_DATE} > now();
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true;
        `);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};