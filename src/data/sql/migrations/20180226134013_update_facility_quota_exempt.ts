import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.integer(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.QUOTA_EXEMPT).defaultTo(0);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.QUOTA_EXEMPT);
        }));
    });
};