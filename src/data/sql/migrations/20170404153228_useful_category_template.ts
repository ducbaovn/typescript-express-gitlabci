import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

let initCategoryTemplate = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    /* Create useful categories default and insert 6 item default.;
     * 1. Remember update icon url for the each item inside table.
     * -> Use api upload image, after then call api update category default.
     */
    let SCHEMA = Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA;

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

                table.text(SCHEMA.FIELDS.NAME).notNullable();
                table.string(SCHEMA.FIELDS.ICON_URL, 255).nullable();
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let essentialServices = {};
            essentialServices[SCHEMA.FIELDS.ID] = "EssentialServices";
            essentialServices[SCHEMA.FIELDS.NAME] = "Essential Services";
            essentialServices[SCHEMA.FIELDS.DESCRIPTION] = "The essential services.";
            essentialServices[SCHEMA.FIELDS.PRIORITY] = 1;

            let homeServices = {};
            homeServices[SCHEMA.FIELDS.ID] = "HomeServices";
            homeServices[SCHEMA.FIELDS.NAME] = "Home Services";
            homeServices[SCHEMA.FIELDS.DESCRIPTION] = "The home services.";
            homeServices[SCHEMA.FIELDS.PRIORITY] = 2;

            let fixMyHome = {};
            fixMyHome[SCHEMA.FIELDS.ID] = "FixMyHome";
            fixMyHome[SCHEMA.FIELDS.NAME] = "Fix My Home";
            fixMyHome[SCHEMA.FIELDS.DESCRIPTION] = "The fix my home services.";
            fixMyHome[SCHEMA.FIELDS.PRIORITY] = 3;

            let fixMyCar = {};
            fixMyCar[SCHEMA.FIELDS.ID] = "FixMyCar";
            fixMyCar[SCHEMA.FIELDS.NAME] = "Fix My Car";
            fixMyCar[SCHEMA.FIELDS.DESCRIPTION] = "The fix my car services.";
            fixMyCar[SCHEMA.FIELDS.PRIORITY] = 4;

            let findMeACoach = {};
            findMeACoach[SCHEMA.FIELDS.ID] = "FindMeCoach";
            findMeACoach[SCHEMA.FIELDS.NAME] = "Find Me a Coach";
            findMeACoach[SCHEMA.FIELDS.ICON_URL] = "";
            findMeACoach[SCHEMA.FIELDS.DESCRIPTION] = "The find me a coach services.";
            findMeACoach[SCHEMA.FIELDS.PRIORITY] = 5;

            let findMeATutor = {};
            findMeATutor[SCHEMA.FIELDS.ID] = "FindMeTutor";
            findMeATutor[SCHEMA.FIELDS.NAME] = "Find Me a Tutor";
            findMeATutor[SCHEMA.FIELDS.DESCRIPTION] = "The find me a tutor services.";
            findMeATutor[SCHEMA.FIELDS.PRIORITY] = 6;

            return promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(essentialServices),
                knex(SCHEMA.TABLE_NAME).insert(homeServices),
                knex(SCHEMA.TABLE_NAME).insert(fixMyHome),
                knex(SCHEMA.TABLE_NAME).insert(fixMyCar),
                knex(SCHEMA.TABLE_NAME).insert(findMeACoach),
                knex(SCHEMA.TABLE_NAME).insert(findMeATutor)
            ]);
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        initCategoryTemplate(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE ${Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
