import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.boolean(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.MARK_RESOLVED).defaultTo(0).notNullable();

            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.MARK_RESOLVED);
            });
        });
};
