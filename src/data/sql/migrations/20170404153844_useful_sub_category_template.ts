import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

let initSubCategoryTemplate = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    /* Create useful categories default and insert 6 item default.;
     * 1. Remember update icon url for the each item inside table.
     * -> Use api upload image, after then call api update category default.
     */
    let SCHEMA = Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA;
    let insList: any[] = [];
    let categoryId: string = "";

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

                table.string(SCHEMA.FIELDS.CATEGORY_ID, 36).notNullable().index()
                    .references(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.text(SCHEMA.FIELDS.NAME).notNullable();
                table.string(SCHEMA.FIELDS.ICON_URL, 255).nullable();
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            insList = [];
            categoryId = "EssentialServices";
            let recordsDefault: any[] = [
                {
                    name: "Doctor",
                    priority: 1
                },
                {
                    name: "Locksmith",
                    priority: 2
                },
                {
                    name: "Dentist",
                    priority: 3
                },
                {
                    name: "Kindergarten",
                    priority: 4
                },
                {
                    name: "Maid Agency",
                    priority: 5
                },
                {
                    name: "Optometrist",
                    priority: 6
                },
                {
                    name: "Ambulance",
                    priority: 7
                },
                {
                    name: "TCM",
                    priority: 8
                },
                {
                    name: "Vet",
                    priority: 9
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        })
        .then(() => {
            insList = [];
            categoryId = "HomeServices";
            let recordsDefault: any[] = [
                {
                    name: "Catering",
                    priority: 1
                },
                {
                    name: "Dry Cleaning",
                    priority: 2
                },
                {
                    name: "Elder Care",
                    priority: 3
                },
                {
                    name: "Fresh Food Supply",
                    priority: 4
                },
                {
                    name: "Part-time Cleaner",
                    priority: 5
                },
                {
                    name: "Party!",
                    priority: 6
                },
                {
                    name: "Pet Care",
                    priority: 7
                },
                {
                    name: "Removalist",
                    priority: 8
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        })
        .then(() => {
            insList = [];
            categoryId = "FixMyHome";
            let recordsDefault: any[] = [
                {
                    name: "Air-con Servicing",
                    priority: 1
                },
                {
                    name: "Carpenter",
                    priority: 2
                },
                {
                    name: "Curtains and Blinds",
                    priority: 3
                },
                {
                    name: "Electrician",
                    priority: 4
                },
                {
                    name: "Electronic Door Lock",
                    priority: 5
                },
                {
                    name: "Fridge Repair",
                    priority: 6
                },
                {
                    name: "Handyman",
                    priority: 7
                },
                {
                    name: "Interior Design",
                    priority: 8
                },
                {
                    name: "Invisigrille",
                    priority: 9
                },
                {
                    name: "Leaking Specialist",
                    priority: 10
                },
                {
                    name: "Locksmith",
                    priority: 11
                },
                {
                    name: "Marble Polisher",
                    priority: 12
                },
                {
                    name: "Painters",
                    priority: 13
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        })
        .then(() => {
            insList = [];
            categoryId = "FixMyCar";
            let recordsDefault: any[] = [
                {
                    name: "Auto Services",
                    priority: 1
                },
                {
                    name: "Bodyshop",
                    priority: 2
                },
                {
                    name: "Battery Service",
                    priority: 3
                },
                {
                    name: "Car Groomer",
                    priority: 4
                },
                {
                    name: "In-car Camera",
                    priority: 5
                },
                {
                    name: "Towing",
                    priority: 6
                },
                {
                    name: "Tyre",
                    priority: 7
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        })
        .then(() => {
            insList = [];
            categoryId = "FindMeCoach";
            let recordsDefault: any[] = [
                {
                    name: "Dance",
                    priority: 1
                },
                {
                    name: "Golf",
                    priority: 2
                },
                {
                    name: "Martial Art",
                    priority: 3
                },
                {
                    name: "Personal Trainer",
                    priority: 4
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        })
        .then(() => {
            insList = [];
            categoryId = "FindMeTutor";
            let recordsDefault: any[] = [
                {
                    name: "Art",
                    priority: 1
                },
                {
                    name: "Chinese Primary",
                    priority: 2
                },
                {
                    name: "Chinese Secondary",
                    priority: 3
                },
                {
                    name: "English Primary",
                    priority: 4
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = UUID();
                obj[SCHEMA.FIELDS.CATEGORY_ID] = categoryId;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.PRIORITY] = item.priority;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        initSubCategoryTemplate(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE ${Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
