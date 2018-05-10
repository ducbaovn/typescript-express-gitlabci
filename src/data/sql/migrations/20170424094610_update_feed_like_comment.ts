import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.GARAGE_SALE_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.table(Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.string(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.TYPE, 255).nullable().comment("Chatterbox; FindABuddy; SponsorAds");

            });
        })
        .then(() => {
            return knex.schema.table(Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.string(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.TYPE, 255).nullable().comment("Chatterbox; FindABuddy; SponsorAds");

            });
        })
        .then(() => {
            return knex.schema.table(Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropForeign([Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID]);
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.TYPE);

            });
        })
        .then(() => {
            return knex.schema.table(Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.dropColumn(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.TYPE);

            });
        })
        .then(() => {
            return knex.schema.table(Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME, function (table) {
                table.foreign(Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.FEED_ID)
                    .references(Schema.FEED_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FEED_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};
