import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.TITLE_DETAIL, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DAY, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.TIME, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.VENUE, 255);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.COVER_PICTURE, 255);
                table.boolean(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE).notNullable().defaultTo(0);
                table.string(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.FILE, 255);
                table.boolean(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE).notNullable().defaultTo(0);

            }));
        })
        .then(() => {
            return knex.schema.table(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW, 255);
                table.string(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_DETAIL, 255);
                table.string(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.WEBSITE, 255);
                table.string(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.FILE, 255);
                table.string(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.COVER_PICTURE, 255);
                table.boolean(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE).notNullable().defaultTo(0);

            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DAY);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.DATE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.TIME);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.VENUE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.COVER_PICTURE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.FILE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_LIST_VIEW);
                table.dropColumn(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.TITLE_DETAIL);
                table.dropColumn(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.WEBSITE);
                table.dropColumn(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.FILE);
                table.dropColumn(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.COVER_PICTURE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE);
                table.dropColumn(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.IS_FILE_ENABLE);
            }));
        });
};
