import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.SESSION_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM, 255).nullable().defaultTo("");
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.SESSION_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.SESSION_TABLE_SCHEMA.FIELDS.PLATFORM);
        }));
    });
};