import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

/**
 * Create feedback category table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const feedback_category_table = (knex, Promise) => {
    let SCHEMA = Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.KEYWORD, 255).notNullable();
                table.integer(SCHEMA.FIELDS.ORDER_INDEX).notNullable();
            });
        }).then(() => {
            let leaks = {};
            leaks[SCHEMA.FIELDS.ID] = UUID();
            leaks[SCHEMA.FIELDS.NAME] = "leaks";
            leaks[SCHEMA.FIELDS.KEYWORD] = "LEAKS";
            leaks[SCHEMA.FIELDS.ORDER_INDEX] = 1;

            let security = {};
            security[SCHEMA.FIELDS.ID] = UUID();
            security[SCHEMA.FIELDS.NAME] = "security";
            security[SCHEMA.FIELDS.KEYWORD] = "SECURITY";
            security[SCHEMA.FIELDS.ORDER_INDEX] = 2;

            let cleanliness = {};
            cleanliness[SCHEMA.FIELDS.ID] = UUID();
            cleanliness[SCHEMA.FIELDS.NAME] = "cleanliness";
            cleanliness[SCHEMA.FIELDS.KEYWORD] = "CLEANLINESS";
            cleanliness[SCHEMA.FIELDS.ORDER_INDEX] = 3;

            let landscape = {};
            landscape[SCHEMA.FIELDS.ID] = UUID();
            landscape[SCHEMA.FIELDS.NAME] = "landscape";
            landscape[SCHEMA.FIELDS.KEYWORD] = "LANDSCAPE";
            landscape[SCHEMA.FIELDS.ORDER_INDEX] = 4;

            let facilitiesCommon = {};
            facilitiesCommon[SCHEMA.FIELDS.ID] = UUID();
            facilitiesCommon[SCHEMA.FIELDS.NAME] = "facilities and common area";
            facilitiesCommon[SCHEMA.FIELDS.KEYWORD] = "FACILITIES_COMMON";
            facilitiesCommon[SCHEMA.FIELDS.ORDER_INDEX] = 5;

            let others = {};
            others[SCHEMA.FIELDS.ID] = UUID();
            others[SCHEMA.FIELDS.NAME] = "others";
            others[SCHEMA.FIELDS.KEYWORD] = "OTHERS";
            others[SCHEMA.FIELDS.ORDER_INDEX] = 6;

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(leaks),
                knex(SCHEMA.TABLE_NAME).insert(security),
                knex(SCHEMA.TABLE_NAME).insert(cleanliness),
                knex(SCHEMA.TABLE_NAME).insert(landscape),
                knex(SCHEMA.TABLE_NAME).insert(facilitiesCommon),
                knex(SCHEMA.TABLE_NAME).insert(others)
            ]);
        });
};

/**
 * Create feedback table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const feedback_table = (knex, Promise) => {
    let SCHEMA = Schema.FEEDBACK_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.TITLE, 255).notNullable();
                table.text(SCHEMA.FIELDS.CONTENT).notNullable();
                table.specificType(SCHEMA.FIELDS.IMAGE_URL, "text[]").nullable();
                table.string(SCHEMA.FIELDS.STATUS, 255).nullable();
                table.dateTime(SCHEMA.FIELDS.DATE_RECEIVED).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.DATE_RESOLVED).nullable();

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID, 36).notNullable().index()
                    .references(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).nullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};


exports.up = function (knex, Promise) {
    return Promise.resolve()
        .then(() => {
            return feedback_category_table(knex, Promise);
        })
        .then(() => {
            return feedback_table(knex, Promise);
        });
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
