import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID} DROP NOT NULL`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID} SET NOT NULL`);
        });
};