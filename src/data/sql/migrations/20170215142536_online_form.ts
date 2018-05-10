import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

/**
 * Create online_form_category table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const online_form_category = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 255).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                // table.string(SCHEMA.FIELDS.KEYWORD, 255).notNullable();
            });
        })
        .then(() => {
            let accessCard = {};
            accessCard[SCHEMA.FIELDS.ID] = "AccessCard";
            accessCard[SCHEMA.FIELDS.NAME] = "Access Card";

            let carLabel = {};
            carLabel[SCHEMA.FIELDS.ID] = "CarLabel";
            carLabel[SCHEMA.FIELDS.NAME] = "Car Label";

            let transponder = {};
            transponder[SCHEMA.FIELDS.ID] = "Transponder";
            transponder[SCHEMA.FIELDS.NAME] = "Transponder";


            let iuRegistration = {};
            iuRegistration[SCHEMA.FIELDS.ID] = "IURegistration";
            iuRegistration[SCHEMA.FIELDS.NAME] = "IU Registration";


            let bicycleTag = {};
            bicycleTag[SCHEMA.FIELDS.ID] = "BicycleTag";
            bicycleTag[SCHEMA.FIELDS.NAME] = "Bicycle Tag";

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(accessCard),
                knex(SCHEMA.TABLE_NAME).insert(carLabel),
                knex(SCHEMA.TABLE_NAME).insert(transponder),
                knex(SCHEMA.TABLE_NAME).insert(iuRegistration),
                knex(SCHEMA.TABLE_NAME).insert(bicycleTag),
            ]);
        });
};

/**
 * Create online_form_table table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const online_form_table = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.float(SCHEMA.FIELDS.PRICE).notNullable();
                table.integer(SCHEMA.FIELDS.COUNT_OF_REQUEST).notNullable();
                table.string(SCHEMA.FIELDS.TC_URL, 255).nullable();

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID, 255).notNullable().index()
                    .references(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRIORITY).nullable();
            });
        });
};

/**
 * Create online_form_request_table table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const online_form_request_table = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.ONLINE_FORM_ID, 36).notNullable().index()
                    .references(Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.float(SCHEMA.FIELDS.PRICE).notNullable();
                table.float(SCHEMA.FIELDS.TOTAL).notNullable();
                table.integer(SCHEMA.FIELDS.NUMBER_OF_ITEMS).notNullable().defaultTo(0);
                table.string(SCHEMA.FIELDS.VEHICLE_NUMBER, 255).nullable();
                table.string(SCHEMA.FIELDS.IU_NUMBER, 255).nullable();
                table.string(SCHEMA.FIELDS.PROOF_OF_CAR, 255).nullable();

                table.string(SCHEMA.FIELDS.USER_HANDLER_ID, 36).nullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.TRANSACTION_ID, 255).nullable();
                table.string(SCHEMA.FIELDS.STATUS, 255).nullable();
            });
        });
};

const online_form_request_items_table = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.ONLINE_FORM_REQUEST_ID, 36).notNullable().index()
                    .references(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.REMARKS, 255).nullable();
                table.string(SCHEMA.FIELDS.SERIAL_NUMBER, 255).nullable();
            });
        });
};

/**
 * Create condo_rules_table table and its default data
 * @param knex
 * @param Promise
 * @returns {Promise.<TResult>|Promise<R2|R1>|Promise<R>}
 */
const condo_rules_table = (knex, Promise) => {
    let SCHEMA = Schema.CONDO_RULES_TABLE_SCHEMA;
    return Promise.resolve()
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

                table.string(SCHEMA.FIELDS.TITLE, 255).nullable();
                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.DOCUMENT, 255).nullable();
                table.string(SCHEMA.FIELDS.LINK, 255).nullable();
            });
        });
};

/**
 * Create council_minutes_table table and its default data
 * @param knex
 * @param Promise
 * @returns {Promise.<TResult>|Promise<R2|R1>|Promise<R>}
 */
const council_minutes_table = (knex, Promise) => {
    let SCHEMA = Schema.COUNCIL_MINUTES_TABLE_SCHEMA;
    return Promise.resolve()
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

                table.string(SCHEMA.FIELDS.TITLE, 255).nullable();
                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.DOCUMENT, 255).nullable();
                table.string(SCHEMA.FIELDS.LINK, 255).nullable();
            });
        });
};

/**
 * Create housing_loan_table table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const housing_loan_table = (knex, Promise) => {
    let SCHEMA = Schema.HOUSING_LOAN_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).nullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.YR1, 255).nullable();
                table.string(SCHEMA.FIELDS.YR2, 255).nullable();
                table.string(SCHEMA.FIELDS.YR3, 255).nullable();
                table.string(SCHEMA.FIELDS.YR4, 255).nullable();
                table.string(SCHEMA.FIELDS.YR_OTHER, 255).nullable();
                table.string(SCHEMA.FIELDS.RATE_TYPE, 255).nullable();
                table.string(SCHEMA.FIELDS.LOCK_IN_PERIOD, 255).nullable();
                table.string(SCHEMA.FIELDS.LEGAL_SUBSIDY, 255).nullable();
                table.string(SCHEMA.FIELDS.IKEA_VOUCHER, 255).nullable();
                table.text(SCHEMA.FIELDS.MESSAGE).nullable();
                table.specificType(Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.EMAILS, "text[]").nullable();
            });
        })
        .then(() => {
            let housingLoan = {};
            housingLoan[SCHEMA.FIELDS.ID] = UUID();
            housingLoan[SCHEMA.FIELDS.YR1] = "1.00%";
            housingLoan[SCHEMA.FIELDS.YR2] = "1.40%";
            housingLoan[SCHEMA.FIELDS.YR3] = "1.40%";
            housingLoan[SCHEMA.FIELDS.YR4] = "1.65%";
            housingLoan[SCHEMA.FIELDS.YR_OTHER] = "1.65";
            housingLoan[SCHEMA.FIELDS.RATE_TYPE] = "floating 48-mth FDR";
            housingLoan[SCHEMA.FIELDS.LOCK_IN_PERIOD] = "NIL";
            housingLoan[SCHEMA.FIELDS.LEGAL_SUBSIDY] = "$1800(loan >$500k)";
            housingLoan[SCHEMA.FIELDS.IKEA_VOUCHER] = "$1800(loan >$500k)";
            housingLoan[SCHEMA.FIELDS.MESSAGE] = "The Home Loan Savings Bank has been serving the financial needs of the Coshocton County area for over 120 years. \n Our relationship to the community has remained as strong as it was from our beginning, and it continues to grow today.\nAll of the decisions regarding loans and bank operations are made locally, and we are able to tailor our services to truly meet the needs of our customers. Our focus is on building long-term relationships, and not just opening new accounts.";
            // housingLoan[SCHEMA.FIELDS.EMAILS] = "";

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(housingLoan)
            ]);

        });
};

exports.up = function (knex, Promise) {
    return Promise.resolve()
        .then(() => {
            return housing_loan_table(knex, Promise);
        })
        .then(() => {
            return condo_rules_table(knex, Promise);
        })
        .then(() => {
            return council_minutes_table(knex, Promise);
        })
        .then(() => {
            return online_form_category(knex, Promise);
        })
        .then(() => {
            return online_form_table(knex, Promise);
        })
        .then(() => {
            return online_form_request_table(knex, Promise);
        })
        .then(() => {
            return online_form_request_items_table(knex, Promise);
        });

};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CONDO_RULES_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.COUNCIL_MINUTES_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
