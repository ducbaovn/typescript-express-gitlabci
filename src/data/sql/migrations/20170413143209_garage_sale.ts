import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

/**
 * create garage_sale_category
 * @param knex
 * @param Promise
 * @returns {Bluebird<U>}
 */
let garageSaleCategory = (knex, Promise) => {
    let SCHEMA = Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 255).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
            });
        })
        .then(() => {
            let kids = {};
            kids[SCHEMA.FIELDS.ID] = "Kids";
            kids[SCHEMA.FIELDS.NAME] = "kids";
            kids[SCHEMA.FIELDS.PRIORITY] = 0;

            let homeware = {};
            homeware[SCHEMA.FIELDS.ID] = "Homeware";
            homeware[SCHEMA.FIELDS.NAME] = "homeware";
            homeware[SCHEMA.FIELDS.PRIORITY] = 1;

            let fashion = {};
            fashion[SCHEMA.FIELDS.ID] = "Fashion";
            fashion[SCHEMA.FIELDS.NAME] = "fashion";
            fashion[SCHEMA.FIELDS.PRIORITY] = 2;


            let electronics = {};
            electronics[SCHEMA.FIELDS.ID] = "Electronics";
            electronics[SCHEMA.FIELDS.NAME] = "electronics";
            electronics[SCHEMA.FIELDS.PRIORITY] = 3;


            let sports = {};
            sports[SCHEMA.FIELDS.ID] = "Sports";
            sports[SCHEMA.FIELDS.NAME] = "sports";
            sports[SCHEMA.FIELDS.PRIORITY] = 4;

            let furniture = {};
            furniture[SCHEMA.FIELDS.ID] = "Furniture";
            furniture[SCHEMA.FIELDS.NAME] = "furniture";
            furniture[SCHEMA.FIELDS.PRIORITY] = 5;

            let others = {};
            others[SCHEMA.FIELDS.ID] = "Others";
            others[SCHEMA.FIELDS.NAME] = "others";
            others[SCHEMA.FIELDS.PRIORITY] = 6;

            return Promise.all([
                knex(SCHEMA.TABLE_NAME).insert(kids),
                knex(SCHEMA.TABLE_NAME).insert(homeware),
                knex(SCHEMA.TABLE_NAME).insert(fashion),
                knex(SCHEMA.TABLE_NAME).insert(electronics),
                knex(SCHEMA.TABLE_NAME).insert(sports),
                knex(SCHEMA.TABLE_NAME).insert(furniture),
                knex(SCHEMA.TABLE_NAME).insert(others),
            ]);
        });
};

/**
 * create garage_sale_table
 * @param knex
 * @param Promise
 * @returns {Bluebird<SchemaBuilder>}
 */
let garageSale = (knex, Promise) => {
    let SCHEMA = Schema.GARAGE_SALE_TABLE_SCHEMA;
    return Promise.resolve()
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

                table.string(SCHEMA.FIELDS.GARAGE_SALE_CATEGORY_ID, 36).notNullable().index()
                    .references(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.TITLE, 255).nullable();
                table.string(SCHEMA.FIELDS.TYPE, 255).nullable();
                table.string(SCHEMA.FIELDS.PRICE, 255).nullable();
                table.text(SCHEMA.FIELDS.CONTENT).nullable();
                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.specificType(SCHEMA.FIELDS.IMAGES, "text[]").nullable();
                table.string(SCHEMA.FIELDS.STATUS, 255).nullable();

            });
        });
};

/**
 * create garage sale like
 * @param knex
 * @param promise
 * @returns {Bluebird<SchemaBuilder>}
 */
let garageSaleLike = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.GARAGE_SALE_LIKE_TABLE_SCHEMA;
    return promise.resolve()
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

                table.string(SCHEMA.FIELDS.GARAGE_SALE_ID, 36).notNullable().index()
                    .references(Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

/**
 * clusteringCondo
 * @param knex
 * @param promise
 * @returns {Bluebird<SchemaBuilder>}
 */
let clusteringCondo = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.CLUSTERING_CONDO_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).nullable();
                table.specificType(SCHEMA.FIELDS.LIST_CONDO, "text[]").nullable();
                table.boolean(SCHEMA.FIELDS.IS_GARAGE_SALE).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_FIND_BUDDY).notNullable().defaultTo(0);
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        garageSaleCategory(knex, promise),
        garageSale(knex, promise),
        garageSaleLike(knex, promise),
        clusteringCondo(knex, promise)
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.GARAGE_SALE_LIKE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CLUSTERING_CONDO_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
