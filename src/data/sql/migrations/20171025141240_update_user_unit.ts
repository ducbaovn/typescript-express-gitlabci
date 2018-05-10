import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.boolean(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.HAD_EXPIRED_REMINDER).notNullable().defaultTo(0);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.HAD_EXPIRED_REMINDER);
        }));
    });
};