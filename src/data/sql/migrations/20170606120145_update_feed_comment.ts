import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropForeign([Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID]);
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};