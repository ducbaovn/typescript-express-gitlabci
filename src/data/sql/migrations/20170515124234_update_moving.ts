import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { STATUS_MOVING } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS).notNullable().defaultTo(STATUS_MOVING.LIVE);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.MOVING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.MOVING_TABLE_SCHEMA.FIELDS.STATUS);
            }));
        });
};
