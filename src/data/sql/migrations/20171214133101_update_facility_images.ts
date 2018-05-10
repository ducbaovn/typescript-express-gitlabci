import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.schema.table(SCHEMA.TABLE_NAME, (table => {
            table.specificType(SCHEMA.FIELDS.IMAGE_URL, "text[]").nullable();
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.schema.table(SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(SCHEMA.FIELDS.IMAGE_URL);
        }));
    });
};