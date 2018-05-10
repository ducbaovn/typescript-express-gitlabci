import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.schema.table(SCHEMA.TABLE_NAME, (table => {
            table.boolean(SCHEMA.FIELDS.ALLOW_BEFORE_END_TIME).notNullable().defaultTo(false);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.schema.table(SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(SCHEMA.FIELDS.ALLOW_BEFORE_END_TIME);
        }));
    });
};