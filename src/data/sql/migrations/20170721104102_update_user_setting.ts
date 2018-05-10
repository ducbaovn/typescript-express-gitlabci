import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USER_SETTING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.boolean(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_LOVE).notNullable().defaultTo(true);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USER_SETTING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.IS_RECEIVER_PUSH_LOVE);
            }));
        });
};