import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";
import {ONLINE_FORM_SUB_CATEGORY} from "../../../libs/constants";


/**
 * Create online_form_category_template table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const online_form_category_template = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 255).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
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
 * Create online_form_sub_category_template table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const online_form_sub_category_template = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA;
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

                table.string(SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID, 255).notNullable().index()
                    .references(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        })
        .then(() => {
            let newCard = {};
            newCard[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.NEW_CARD;
            newCard[SCHEMA.FIELDS.NAME] = "new card";
            newCard[SCHEMA.FIELDS.PRIORITY] = 1;
            newCard[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "AccessCard";

            let lostCard = {};
            lostCard[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.LOST_CARD;
            lostCard[SCHEMA.FIELDS.NAME] = "lost card";
            lostCard[SCHEMA.FIELDS.PRIORITY] = 2;
            lostCard[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "AccessCard";

            let faultyCard = {};
            faultyCard[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.FAULTY_CARD;
            faultyCard[SCHEMA.FIELDS.NAME] = "faulty card";
            faultyCard[SCHEMA.FIELDS.PRIORITY] = 3;
            faultyCard[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "AccessCard";

            let carLabelFirstCar = {};
            carLabelFirstCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_FIRST_CAR;
            carLabelFirstCar[SCHEMA.FIELDS.NAME] = "first car";
            carLabelFirstCar[SCHEMA.FIELDS.PRIORITY] = 1;
            carLabelFirstCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "CarLabel";

            let carLabelSecondCar = {};
            carLabelSecondCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_SECOND_CAR;
            carLabelSecondCar[SCHEMA.FIELDS.NAME] = "second car";
            carLabelSecondCar[SCHEMA.FIELDS.PRIORITY] = 2;
            carLabelSecondCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "CarLabel";

            let transponderFirstCar = {};
            transponderFirstCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.TRANSPONDER_FIRST_CAR;
            transponderFirstCar[SCHEMA.FIELDS.NAME] = "first car";
            transponderFirstCar[SCHEMA.FIELDS.PRIORITY] = 1;
            transponderFirstCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "Transponder";

            let transponderSecondCar = {};
            transponderSecondCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.TRANSPONDER_SECOND_CAR;
            transponderSecondCar[SCHEMA.FIELDS.NAME] = "second car";
            transponderSecondCar[SCHEMA.FIELDS.PRIORITY] = 2;
            transponderSecondCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "Transponder";

            let iuRegistrationFirstCar = {};
            iuRegistrationFirstCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.IU_REGISTRATION_FIRST_CAR;
            iuRegistrationFirstCar[SCHEMA.FIELDS.NAME] = "first car";
            iuRegistrationFirstCar[SCHEMA.FIELDS.PRIORITY] = 1;
            iuRegistrationFirstCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "IURegistration";

            let iuRegistrationSecondCar = {};
            iuRegistrationSecondCar[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.IU_REGISTRATION_SECOND_CAR;
            iuRegistrationSecondCar[SCHEMA.FIELDS.NAME] = "second car";
            iuRegistrationSecondCar[SCHEMA.FIELDS.PRIORITY] = 2;
            iuRegistrationSecondCar[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "IURegistration";

            let noType = {};
            noType[SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.NO_TYPE;
            noType[SCHEMA.FIELDS.NAME] = "no type";
            noType[SCHEMA.FIELDS.PRIORITY] = 0;
            noType[SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "BicycleTag";

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(newCard),
                knex(SCHEMA.TABLE_NAME).insert(lostCard),
                knex(SCHEMA.TABLE_NAME).insert(faultyCard),
                knex(SCHEMA.TABLE_NAME).insert(carLabelFirstCar),
                knex(SCHEMA.TABLE_NAME).insert(carLabelSecondCar),
                knex(SCHEMA.TABLE_NAME).insert(transponderFirstCar),
                knex(SCHEMA.TABLE_NAME).insert(transponderSecondCar),
                knex(SCHEMA.TABLE_NAME).insert(iuRegistrationFirstCar),
                knex(SCHEMA.TABLE_NAME).insert(iuRegistrationSecondCar),
                knex(SCHEMA.TABLE_NAME).insert(noType),
            ]);
        });
};

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
            table.string(SCHEMA.FIELDS.TC_URL, 255);

            table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID, 255).notNullable().index()
                .references(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    });
};

const online_form_sub_category = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA;
    return Promise.resolve()
    .then(() => {
        return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
            table.string(SCHEMA.FIELDS.ID, 255).notNullable().primary();
            table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
            table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index();

            table.string(SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID, 255).notNullable().index()
                .references(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID, 255).notNullable().index()
                .references(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    });
};

const online_form_fee = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_FEE_TABLE_SCHEMA;
    return Promise.resolve()
    .then(() => {
        return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
            table.string(SCHEMA.FIELDS.ID, 255).notNullable().primary();
            table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.float(SCHEMA.FIELDS.PRICE).notNullable();

            table.string(SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID, 255).notNullable().index()
                .references(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    });
};

const add_column_online_form_request = (knex, Promise) => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA;
    return Promise.resolve()
    .then(() => {
        return knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
            table.string(SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID, 255).nullable().index()
                .references(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    });
};

export const up = (knex: Knex, promise: typeof Promise): Promise<any> => {
    return promise.resolve()
    .then(() => {
        return  knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
    })
    .then(() => {
        return online_form_category_template(knex, Promise);
    })
    .then(() => {
        return online_form_sub_category_template(knex, Promise);
    })
    .then(() => {
        return online_form_category(knex, Promise);
    })
    .then(() => {
        return online_form_sub_category(knex, Promise);
    })
    .then(() => {
        return online_form_fee(knex, Promise);
    })
    .then(() => {
        return add_column_online_form_request(knex, Promise);
    });
};

/**
 * Create online_form_category table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const recover_old_online_form_category = (knex, Promise) => {
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

export const down = (knex: Knex, promise: typeof Promise): Promise<any> => {
    return Promise.all([
        recover_old_online_form_category(knex, Promise),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
            table.dropColumn(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID}`);
        }),
    ]);
};