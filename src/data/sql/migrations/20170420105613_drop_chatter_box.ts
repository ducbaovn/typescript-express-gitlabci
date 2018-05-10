import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return promise.all([
                knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CHATTERBOX_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
                knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CHATTERBOX_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
                knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CHATTERBOX_COMMENT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
                knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CHATTERBOX_COMMENT_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
            ]);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
