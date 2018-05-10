import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.string(Schema.USER_TABLE_SCHEMA.FIELDS.AGENT, 255).defaultTo("").notNullable();
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.USER_TABLE_SCHEMA.FIELDS.AGENT);
            });
        });
};