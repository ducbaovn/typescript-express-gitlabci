import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.TABLE_NAME, table => {
            table.unique([Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID]);
        });
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.TABLE_NAME, table => {
            table.dropUnique([Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID]);
        });
    });
};