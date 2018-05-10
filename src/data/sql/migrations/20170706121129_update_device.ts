import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.DEVICE_TABLE_SCHEMA.FIELDS.BUILD_VERSION).notNullable().defaultTo("");
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.DEVICE_TABLE_SCHEMA.FIELDS.BUILD_VERSION);
            });
        });
};
