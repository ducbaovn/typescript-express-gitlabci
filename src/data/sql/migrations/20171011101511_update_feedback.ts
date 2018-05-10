import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.text(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE).nullable();
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE);
        }));
    });
};