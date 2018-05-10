import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";


let feed = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FEED_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.TITLE, 255).nullable();
                table.string(SCHEMA.FIELDS.TYPE, 255).nullable().comment("Chatterbox; FindABuddy");
                table.text(SCHEMA.FIELDS.CONTENT).nullable();
                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.IMAGE_URL, 255).nullable();
                table.specificType(SCHEMA.FIELDS.TAG, "text[]").nullable();
            });
        });
};

/**
 * create like
 * @param knex
 * @param promise
 * @returns {Bluebird<any>}
 */
let like = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FEED_LIKE_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.FEED_ID, 36).notNullable().index()
                    .references(Schema.FEED_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FEED_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

/**
 * create comment
 * @param knex
 * @param promise
 * @returns {Bluebird<any>}
 */
let comment = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FEED_COMMENT_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.FEED_ID, 36).notNullable().index()
                    .references(Schema.FEED_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FEED_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.text(SCHEMA.FIELDS.CONTENT).nullable();
            });
        });
};

/**
 * create comment like
 * @param knex
 * @param promise
 * @returns {Bluebird<any>}
 */
let commentLike = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.FEED_COMMENT_ID, 36).notNullable().index()
                    .references(Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};
export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        feed(knex, promise),
        like(knex, promise),
        comment(knex, promise),
        commentLike(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEED_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
