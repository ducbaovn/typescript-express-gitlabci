import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";

/**
 * Create roles table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const role = (knex: Knex, Promise: typeof Bluebird) => {
    // create role table;
    let SCHEMA = Schema.ROLE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 100).notNullable();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let condoManager = {};
            condoManager[SCHEMA.FIELDS.ID] = "condo_manager";
            condoManager[SCHEMA.FIELDS.NAME] = "Condo Manager";
            condoManager[SCHEMA.FIELDS.DESCRIPTION] = "Condo Manager Role";

            let owner = {};
            owner[SCHEMA.FIELDS.ID] = "owner";
            owner[SCHEMA.FIELDS.NAME] = "Owner";
            owner[SCHEMA.FIELDS.DESCRIPTION] = "Owner Role";

            let tenant = {};
            tenant[SCHEMA.FIELDS.ID] = "tenant";
            tenant[SCHEMA.FIELDS.NAME] = "Tenant";
            tenant[SCHEMA.FIELDS.DESCRIPTION] = "Tenant Role";

            let systemAdmin = {};
            systemAdmin[SCHEMA.FIELDS.ID] = "system_admin";
            systemAdmin[SCHEMA.FIELDS.NAME] = "System Admin";
            systemAdmin[SCHEMA.FIELDS.DESCRIPTION] = "System Admin Role";

            let manager = {};
            manager[Schema.ROLE_TABLE_SCHEMA.FIELDS.ID] = "manager";
            manager[Schema.ROLE_TABLE_SCHEMA.FIELDS.NAME] = "Manager";
            manager[Schema.ROLE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = "Manager Admin Portal Role";

            let salesExecutive = {};
            salesExecutive[Schema.ROLE_TABLE_SCHEMA.FIELDS.ID] = "sales_executive";
            salesExecutive[Schema.ROLE_TABLE_SCHEMA.FIELDS.NAME] = "Sales Executive";
            salesExecutive[Schema.ROLE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = "Sales Executive Portal Role";

            let fakeUser = {};
            fakeUser[SCHEMA.FIELDS.ID] = "fake_user";
            fakeUser[SCHEMA.FIELDS.NAME] = "Fake User";
            fakeUser[SCHEMA.FIELDS.DESCRIPTION] = "Fake User Role";

            let user = {};
            user[Schema.ROLE_TABLE_SCHEMA.FIELDS.ID] = "user";
            user[Schema.ROLE_TABLE_SCHEMA.FIELDS.NAME] = "User";
            user[Schema.ROLE_TABLE_SCHEMA.FIELDS.DESCRIPTION] = "User Role";

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(condoManager),
                knex(SCHEMA.TABLE_NAME).insert(owner),
                knex(SCHEMA.TABLE_NAME).insert(tenant),
                knex(SCHEMA.TABLE_NAME).insert(systemAdmin),
                knex(SCHEMA.TABLE_NAME).insert(manager),
                knex(SCHEMA.TABLE_NAME).insert(salesExecutive),
                knex(SCHEMA.TABLE_NAME).insert(fakeUser),
                knex(SCHEMA.TABLE_NAME).insert(user)
            ]);
        });
};

/**
 * Create condo table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const condo = (knex, Promise) => {
    // create condo table;
    let SCHEMA = Schema.CONDO_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.ADDRESS1, 255).nullable();
                table.string(SCHEMA.FIELDS.ADDRESS2, 255).nullable();
                table.string(SCHEMA.FIELDS.EMAIL, 255).nullable();
                table.string(SCHEMA.FIELDS.IMAGE_URL, 255).notNullable();
                table.float(SCHEMA.FIELDS.LATITUDE).notNullable();
                table.float(SCHEMA.FIELDS.LONGITUDE).notNullable();
                table.string(SCHEMA.FIELDS.COUNTRY, 255).nullable();
                table.string(SCHEMA.FIELDS.POST_CODE, 255).nullable();

                table.string(SCHEMA.FIELDS.OFFICE_PHONE1, 255).nullable();
                table.string(SCHEMA.FIELDS.OFFICE_PHONE2, 255).nullable();
                table.string(SCHEMA.FIELDS.SECURITY_OFFICE_PHONE, 255).nullable();
                table.string(SCHEMA.FIELDS.BRAINTREE_MERCHANTID, 255).nullable();
                table.string(SCHEMA.FIELDS.BRAINTREE_PUBLICKEY, 255).nullable();
                table.string(SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY, 255).nullable();
                table.string(SCHEMA.FIELDS.GENERAL_EMAIL, 255).nullable();
                table.string(SCHEMA.FIELDS.NEW_USER_NOTIFICATION_EMAIL, 255).nullable();
                table.string(SCHEMA.FIELDS.ONLINE_FORM_NOTIFICATION_EMAIL, 255).nullable();
                table.string(SCHEMA.FIELDS.FEEDBACK_NOTIFICATION_EMAIL, 255).nullable();
                table.boolean(SCHEMA.FIELDS.PAY_BY_CASH).nullable().defaultTo(0);
            });
        })
        .then(() => {
            if (process.env.NODE_ENV !== "production") {
                let condoTmp = [];
                let condo1 = {};
                condo1[SCHEMA.FIELDS.ID] = "00b0865a-5053-4caa-8997-5f1025fa8db6";
                condo1[SCHEMA.FIELDS.NAME] = "Whitewater";
                condo1[SCHEMA.FIELDS.ADDRESS1] = "298 - 302 BEACH ROAD";
                condo1[SCHEMA.FIELDS.EMAIL] = "";
                condo1[SCHEMA.FIELDS.OFFICE_PHONE1] = "+65 92329722";
                condo1[SCHEMA.FIELDS.SECURITY_OFFICE_PHONE] = "+65 92329722";
                condo1[SCHEMA.FIELDS.IMAGE_URL] = "https://www.singaporeexpats.com/singapore-property-pictures/properties/concourse-skyline/01concourse-skyline.jpg";
                condo1[SCHEMA.FIELDS.LATITUDE] = 1.300258;
                condo1[SCHEMA.FIELDS.LONGITUDE] = 103.8618539;
                condo1[SCHEMA.FIELDS.COUNTRY] = "Singapore";
                condo1[SCHEMA.FIELDS.POST_CODE] = "123456";

                condo1[SCHEMA.FIELDS.OFFICE_PHONE1] = "123456";
                condo1[SCHEMA.FIELDS.OFFICE_PHONE2] = "123456";
                condo1[SCHEMA.FIELDS.SECURITY_OFFICE_PHONE] = "123456";

                condo1[SCHEMA.FIELDS.BRAINTREE_MERCHANTID] = "123456";
                condo1[SCHEMA.FIELDS.BRAINTREE_PUBLICKEY] = "123456";
                condo1[SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY] = "123456";

                condo1[SCHEMA.FIELDS.GENERAL_EMAIL] = "truong@ventuso.net";
                condo1[SCHEMA.FIELDS.NEW_USER_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                condo1[SCHEMA.FIELDS.ONLINE_FORM_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                condo1[SCHEMA.FIELDS.FEEDBACK_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                condo1[SCHEMA.FIELDS.PAY_BY_CASH] = false;


                condoTmp.push(knex(SCHEMA.TABLE_NAME).insert(condo1));

                for (let i = 0; i < 100; i++) {
                    let condo = {};
                    condo[SCHEMA.FIELDS.ID] = UUID();
                    condo[SCHEMA.FIELDS.NAME] = "CONCOURSE SKYLINE" + i;
                    condo[SCHEMA.FIELDS.ADDRESS1] = "298 - 302 BEACH ROAD";
                    condo[SCHEMA.FIELDS.EMAIL] = "";
                    condo[SCHEMA.FIELDS.OFFICE_PHONE1] = "+65 92329722";
                    condo[SCHEMA.FIELDS.SECURITY_OFFICE_PHONE] = "+65 92329722";
                    condo[SCHEMA.FIELDS.IMAGE_URL] = "https://www.singaporeexpats.com/singapore-property-pictures/properties/concourse-skyline/01concourse-skyline.jpg";
                    condo[SCHEMA.FIELDS.LATITUDE] = 1.300258;
                    condo[SCHEMA.FIELDS.LONGITUDE] = 103.8618539;
                    condo[SCHEMA.FIELDS.COUNTRY] = "Singapore";
                    condo[SCHEMA.FIELDS.POST_CODE] = "123456";

                    condo1[SCHEMA.FIELDS.OFFICE_PHONE1] = "123456";
                    condo1[SCHEMA.FIELDS.OFFICE_PHONE2] = "123456";
                    condo1[SCHEMA.FIELDS.SECURITY_OFFICE_PHONE] = "123456";

                    condo1[SCHEMA.FIELDS.BRAINTREE_MERCHANTID] = "123456";
                    condo1[SCHEMA.FIELDS.BRAINTREE_PUBLICKEY] = "123456";
                    condo1[SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY] = "123456";

                    condo1[SCHEMA.FIELDS.GENERAL_EMAIL] = "truong@ventuso.net";
                    condo1[SCHEMA.FIELDS.NEW_USER_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                    condo1[SCHEMA.FIELDS.ONLINE_FORM_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                    condo1[SCHEMA.FIELDS.FEEDBACK_NOTIFICATION_EMAIL] = "ventusotest@gmail.com";
                    condo1[SCHEMA.FIELDS.PAY_BY_CASH] = false;

                    condoTmp.push(knex(SCHEMA.TABLE_NAME).insert(condo));
                }
                return Promise.all(condoTmp);
            }
        });
};

/**
 * Create block table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const block = (knex, Promise) => {
    // create block table;
    let SCHEMA = Schema.BLOCK_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.BLOCK_NUMBER, 36).notNullable();
                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        })
        .then(() => {
            if (process.env.NODE_ENV !== "production") {
                let block1 = {};
                block1[SCHEMA.FIELDS.ID] = "055cc3a7-0f47-4b2b-a845-76650bb94a5a";
                block1[SCHEMA.FIELDS.BLOCK_NUMBER] = "21";
                block1[SCHEMA.FIELDS.CONDO_ID] = "00b0865a-5053-4caa-8997-5f1025fa8db6";

                let block2 = {};
                block2[SCHEMA.FIELDS.ID] = "0e7c50b7-6435-4f48-ac6a-3820a6506743";
                block2[SCHEMA.FIELDS.BLOCK_NUMBER] = "23";
                block2[SCHEMA.FIELDS.CONDO_ID] = "00b0865a-5053-4caa-8997-5f1025fa8db6";

                return Promise.all([
                    // Inserts seed entries
                    knex(SCHEMA.TABLE_NAME).insert(block1),
                    knex(SCHEMA.TABLE_NAME).insert(block2),
                ]);
            }
        });
};

/**
 * Create floor table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const floor = (knex, Promise) => {
    // create floor table;
    let SCHEMA = Schema.FLOOR_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.FLOOR_NUMBER, 36).notNullable();
                table.string(SCHEMA.FIELDS.BLOCK_ID, 36).notNullable().index()
                    .references(Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        })
        .then(() => {
            if (process.env.NODE_ENV !== "production") {
                let floor1 = {};
                floor1[SCHEMA.FIELDS.ID] = "27a20a69-cd71-4335-9ee7-e90ecf92f370";
                floor1[SCHEMA.FIELDS.FLOOR_NUMBER] = "01";
                floor1[SCHEMA.FIELDS.BLOCK_ID] = "055cc3a7-0f47-4b2b-a845-76650bb94a5a";

                let floor2 = {};
                floor2[SCHEMA.FIELDS.ID] = "2bcc23ca-b4e9-428a-ac57-13d244024c99";
                floor2[SCHEMA.FIELDS.FLOOR_NUMBER] = "02";
                floor2[SCHEMA.FIELDS.BLOCK_ID] = "055cc3a7-0f47-4b2b-a845-76650bb94a5a";

                return Promise.all([
                    // Inserts seed entries
                    knex(SCHEMA.TABLE_NAME).insert(floor1),
                    knex(SCHEMA.TABLE_NAME).insert(floor2),
                ]);
            }
        });
};

/**
 * Create unit table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const unit = (knex, Promise) => {
    // create unit table;
    let SCHEMA = Schema.UNIT_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.STACK_NUMBER, 36).notNullable();
                table.string(SCHEMA.FIELDS.UNIT_NUMER, 100).notNullable();

                table.string(SCHEMA.FIELDS.FLOOR_ID, 36).notNullable().index()
                    .references(Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        })
        .then(() => {
            if (process.env.NODE_ENV !== "production") {
                let unit1 = {};
                unit1[SCHEMA.FIELDS.ID] = "36dddcdf-6927-40ec-819a-b43f6c96058a";
                unit1[SCHEMA.FIELDS.STACK_NUMBER] = "01";
                unit1[SCHEMA.FIELDS.UNIT_NUMER] = "210101";
                unit1[SCHEMA.FIELDS.FLOOR_ID] = "27a20a69-cd71-4335-9ee7-e90ecf92f370";

                let unit2 = {};
                unit2[SCHEMA.FIELDS.ID] = "376d8d75-129d-4d38-a6ca-71abf337fd01";
                unit2[SCHEMA.FIELDS.STACK_NUMBER] = "02";
                unit2[SCHEMA.FIELDS.UNIT_NUMER] = "210102";
                unit2[SCHEMA.FIELDS.FLOOR_ID] = "27a20a69-cd71-4335-9ee7-e90ecf92f370";

                return Promise.all([
                    // Inserts seed entries
                    knex(SCHEMA.TABLE_NAME).insert(unit1),
                    knex(SCHEMA.TABLE_NAME).insert(unit2),
                ]);
            }
        });
};

/**
 * Create users table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const user = (knex, Promise) => {
    let SCHEMA = Schema.USER_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.ROLE_ID, 36).notNullable().index()
                    .references(Schema.ROLE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ROLE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.EMAIL, 100).notNullable().unique();
                table.string(SCHEMA.FIELDS.PASSWORD, 255).nullable();
                table.string(SCHEMA.FIELDS.FIRST_NAME, 100).notNullable();
                table.string(SCHEMA.FIELDS.LAST_NAME, 100).notNullable();
                table.text(SCHEMA.FIELDS.AVATAR_URL).nullable();
                table.string(SCHEMA.FIELDS.PHONE_NUMBER, 100).nullable();
                table.text(SCHEMA.FIELDS.STATUS).nullable();
                table.string(SCHEMA.FIELDS.CUSTOMER_ID, 255).nullable();

            });
        })
        .then(() => {
            let systemAdmin = {};
            systemAdmin[SCHEMA.FIELDS.ID] = UUID();
            systemAdmin[SCHEMA.FIELDS.ROLE_ID] = "system_admin";
            systemAdmin[SCHEMA.FIELDS.EMAIL] = "admin@icondo.com";
            systemAdmin[SCHEMA.FIELDS.PASSWORD] = "$2a$10$Wi0mafgo9CnGYd.gK90ZXe5cgEAM0GyzjDsjm63Fq5t0c8su8.6ni";
            systemAdmin[SCHEMA.FIELDS.FIRST_NAME] = "System";
            systemAdmin[SCHEMA.FIELDS.LAST_NAME] = "Admin";
            systemAdmin[SCHEMA.FIELDS.PHONE_NUMBER] = "84281495";



            let manager = {};
            manager[SCHEMA.FIELDS.ID] = UUID();
            manager[SCHEMA.FIELDS.ROLE_ID] = "manager";
            manager[SCHEMA.FIELDS.EMAIL] = "manager@ventuso.net";
            manager[SCHEMA.FIELDS.PASSWORD] = "$2a$10$Wi0mafgo9CnGYd.gK90ZXe5cgEAM0GyzjDsjm63Fq5t0c8su8.6ni";
            manager[SCHEMA.FIELDS.FIRST_NAME] = "Manager Admin";
            manager[SCHEMA.FIELDS.LAST_NAME] = "Ventuso";
            manager[SCHEMA.FIELDS.PHONE_NUMBER] = "";



            let sale = {};
            sale[SCHEMA.FIELDS.ID] = UUID();
            sale[SCHEMA.FIELDS.ROLE_ID] = "sales_executive";
            sale[SCHEMA.FIELDS.EMAIL] = "sales@ventuso.net";
            sale[SCHEMA.FIELDS.PASSWORD] = "$2a$10$Wi0mafgo9CnGYd.gK90ZXe5cgEAM0GyzjDsjm63Fq5t0c8su8.6ni";
            sale[SCHEMA.FIELDS.FIRST_NAME] = "Sales Executive Admin";
            sale[SCHEMA.FIELDS.LAST_NAME] = "Ventuso";
            sale[SCHEMA.FIELDS.PHONE_NUMBER] = "";

            return Promise.all([
                // Inserts seed entries
                knex(SCHEMA.TABLE_NAME).insert(systemAdmin),
                knex(SCHEMA.TABLE_NAME).insert(manager),
                knex(SCHEMA.TABLE_NAME).insert(sale)
            ]);
        });
};

/**
 * Create User Unit Table
 * @param knex
 * @param Promise
 */
const user_unit = (knex, Promise) => {
    let SCHEMA = Schema.USER_UNIT_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
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

                table.string(SCHEMA.FIELDS.UNIT_ID, 36).notNullable().index()
                    .references(Schema.UNIT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.string(SCHEMA.FIELDS.ROLE_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.REMARKS, 255).nullable();
                table.string(SCHEMA.FIELDS.STATUS, 255).nullable();
                table.specificType(SCHEMA.FIELDS.PROOF_URL, "text[]").nullable();
                table.dateTime(SCHEMA.FIELDS.TENANCY_EXPIRY).nullable();
                table.boolean(SCHEMA.FIELDS.IS_MASTER).nullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_RESIDENT).nullable().defaultTo(0);
            });
        });
};

/**
 * Create sessions table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const sessions = (knex, Promise) => {
    // create sessions table;
    let SCHEMA = Schema.SESSION_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.text(SCHEMA.FIELDS.TOKEN).notNullable();
                table.dateTime(SCHEMA.FIELDS.EXPIRE).notNullable();
                table.string(SCHEMA.FIELDS.HASH, 36).notNullable();

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

/**
 * Create setting table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const setting = (knex, Promise) => {
    // create setting table;
    let SCHEMA = Schema.VARIABLE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.KEY, 100).notNullable().unique();
                table.string(SCHEMA.FIELDS.VALUE, 100).notNullable();
                table.string(SCHEMA.FIELDS.DESC, 255).notNullable();
            });
        });
};

/**
 * Create setting table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const phoneNumber = (knex, Promise) => {
    // create setting table;
    let SCHEMA = Schema.PHONE_NUMBER_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.PHONE_NUMBER, 255).notNullable();
                table.integer(SCHEMA.FIELDS.VERIFICATION_CODE).notNullable();
                table.dateTime(SCHEMA.FIELDS.EXPIRE).notNullable();
                table.boolean(SCHEMA.FIELDS.IS_VERIFY).notNullable().defaultTo(false);

            });
        });
};

/**
 * Create devices table and its default data
 * @param knex
 * @param Promise
 * @return {Promise<any>}
 */
const devices = (knex, Promise) => {
    // create setting table;
    let SCHEMA = Schema.DEVICE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.DEVICE_ID, 255).notNullable();
                table.string(SCHEMA.FIELDS.REGISTRAR_ID, 255).notNullable().defaultTo("");
                table.string(SCHEMA.FIELDS.DEVICE_OS, 255).nullable();
                table.string(SCHEMA.FIELDS.DEVICE_MODEL, 255).nullable();
                table.string(SCHEMA.FIELDS.DEVICE_NAME, 255).nullable();
                table.string(SCHEMA.FIELDS.OS_VERSION, 255).nullable();
                table.string(SCHEMA.FIELDS.APP_VERSION, 255).nullable();
                table.integer(SCHEMA.FIELDS.IS_SANDBOX).notNullable().defaultTo(1);
            });
        });
};

/**
 * Create media table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const media = (knex, Promise) => {
    // create setting table;
    let SCHEMA = Schema.MEDIA_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.text(SCHEMA.FIELDS.PATH).notNullable();
                table.text(SCHEMA.FIELDS.URL).notNullable();
                table.string(SCHEMA.FIELDS.HASH, 16).nullable();
            });
        });
};

/**
 * Create latest_transactions table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const latest_transactions = (knex, Promise) => {
    let SCHEMA = Schema.LATEST_TRANSACTION_TABLE_SCHEMA;
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

                table.dateTime(SCHEMA.FIELDS.TRANSACTION_DATE).notNullable();
                table.string(SCHEMA.FIELDS.BLOCK).notNullable();
                table.string(SCHEMA.FIELDS.UNIT_NUMBER).notNullable();
                table.string(SCHEMA.FIELDS.SIZE).notNullable().defaultTo(0);
                table.string(SCHEMA.FIELDS.PRICE).notNullable().defaultTo(0);
                table.string(SCHEMA.FIELDS.PSF).nullable();
                table.string(SCHEMA.FIELDS.TYPE).notNullable();
            });
        });
};

/**
 * Create what_on table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const what_on_table = (knex, Promise) => {
    let SCHEMA = Schema.WHAT_ON_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.TITLE, 255).notNullable();
                table.text(SCHEMA.FIELDS.OPEN_TIME).nullable();
                table.text(SCHEMA.FIELDS.SHORT_DESCRIPTION).nullable();
                table.text(SCHEMA.FIELDS.DESCRIPTION).notNullable();
                table.text(SCHEMA.FIELDS.SIGNATURE).nullable();
                table.string(SCHEMA.FIELDS.PHONE, 255).notNullable();
                table.string(SCHEMA.FIELDS.WEBSITE, 255).nullable();

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.EXPIRY_DATE).notNullable();
                table.integer(SCHEMA.FIELDS.READING_COUNT).nullable();
            });
        });
};

/**
 * Create what_on table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const what_on_image_table = (knex, Promise) => {
    let SCHEMA = Schema.WHAT_ON_IMAGE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.WHAT_ON_ID, 36).notNullable().index()
                    .references(Schema.WHAT_ON_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.IMAGE_URL, 255).notNullable();
                table.integer(SCHEMA.FIELDS.ORDER_INDEX).notNullable();
            });
        });
};

/**
 * Create announcement_table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const announcement_table = (knex, Promise) => {
    let SCHEMA = Schema.ANNOUNCEMENT_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.TITLE, 255).notNullable();
                table.text(SCHEMA.FIELDS.DESCRIPTION).notNullable();
                table.text(SCHEMA.FIELDS.SIGNATURE).nullable();
                table.string(SCHEMA.FIELDS.PHONE, 255).notNullable();

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.dateTime(SCHEMA.FIELDS.DATE_POST).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.EXPIRY_DATE).notNullable();
                table.integer(SCHEMA.FIELDS.READING_COUNT).nullable();
            });
        });
};

/**
 * Create announcement_image table and its default data
 *
 * @param knex
 * @param Promise
 * @returns {Promise<R>|Created|Promise<TResult>|PromiseLike<TResult>|Promise.<TResult>|Promise<R2|R1>}
 */
const announcement_image_table = (knex, Promise) => {
    let SCHEMA = Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA;
    return Promise.resolve()
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.ANNOUNCEMENT_ID, 36).notNullable().index()
                    .references(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.IMAGE_URL, 255).notNullable();
                table.integer(SCHEMA.FIELDS.ORDER_INDEX).notNullable();
            });
        });
};

export const up = (knex, Promise) => {
    return Promise.resolve()
        .then(() => {
            return role(knex, Promise);
        })
        .then(() => {
            return condo(knex, Promise);
        })
        .then(() => {
            return block(knex, Promise);
        })
        .then(() => {
            return floor(knex, Promise);
        })
        .then(() => {
            return unit(knex, Promise);
        })
        .then(() => {
            return user(knex, Promise);
        })
        .then(() => {
            return sessions(knex, Promise);
        })
        .then(() => {
            return setting(knex, Promise);
        })
        .then(() => {
            return devices(knex, Promise);
        })
        .then(() => {
            return phoneNumber(knex, Promise);
        })
        .then(() => {
            return media(knex, Promise);
        })
        .then(() => {
            return user_unit(knex, Promise);
        })
        .then(() => {
            return latest_transactions(knex, Promise);
        })

        .then(() => {
            return what_on_table(knex, Promise);
        })
        .then(() => {
            return what_on_image_table(knex, Promise);
        })
        .then(() => {
            return announcement_table(knex, Promise);
        })
        .then(() => {
            return announcement_image_table(knex, Promise);
        });
};

export const down = (knex, Promise) => {
    return Promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.PHONE_NUMBER_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.VARIABLE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SESSION_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.USER_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ROLE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.MEDIA_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.LATEST_TRANSACTION_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.HOUSING_LOAN_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.TABLE_NAME} CASCADE`)
    ]);
};
