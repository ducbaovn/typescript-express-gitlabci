import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.MERCHANT_ID, 255).notNullable();
            table.string(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PUBLIC_KEY, 255).notNullable();
            table.string(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY, 255).notNullable();
            table.string(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID, 36)
                .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        }));
    })
    .then(() => {
        return knex.schema.createTable(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CUSTOMER_ID, 255).notNullable();
            table.string(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable()
                .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        }));
    })
    .then(() => {
        return knex.raw(`INSERT INTO ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME} (
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.ID},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CUSTOMER_ID},
                    ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID}) 
                SELECT uuid_generate_v4(), false, true, now(), now(), ${Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOMER_ID}, ${Schema.USER_TABLE_SCHEMA.FIELDS.ID} 
                        FROM ${Schema.USER_TABLE_SCHEMA.TABLE_NAME} WHERE ${Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOMER_ID} IS NOT NULL;`);
    })
    .then(() => {
        return knex.raw(`INSERT INTO ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME} (
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.ID},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.MERCHANT_ID},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PUBLIC_KEY},
                    ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID}) 
                SELECT uuid_generate_v4(), false, true, now(), now(), ${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_MERCHANTID}, ${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY}, ${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PUBLICKEY}, ${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID} 
                        FROM ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} WHERE ${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_MERCHANTID} IS NOT NULL;`);
    })
    .then(() => {
        return knex.schema.table(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_MERCHANTID);
            table.dropColumn(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PUBLICKEY);
            table.dropColumn(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY);
        }));
    })
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOMER_ID);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOMER_ID, 36);
        }));
    })
    .then(() => {
        return knex.schema.table(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_MERCHANTID, 255);
            table.string(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PUBLICKEY, 255);
            table.string(Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY, 255);
        }));
    })
    .then(() => {
        return knex.raw(`UPDATE ${Schema.CONDO_TABLE_SCHEMA.TABLE_NAME} c
                SET c.${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_MERCHANTID} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.MERCHANT_ID},
                    c.${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PRIVATEKEY} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY},
                    c.${Schema.CONDO_TABLE_SCHEMA.FIELDS.BRAINTREE_PUBLICKEY} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.PUBLIC_KEY} 
                FROM ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME} b 
                WHERE c.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID} 
                    AND c.${Schema.CONDO_TABLE_SCHEMA.FIELDS.ID} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID};`);
    })
    .then(() => {
        return knex.raw(`UPDATE ${Schema.USER_TABLE_SCHEMA.TABLE_NAME} u
                SET u.${Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOMER_ID} = p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CUSTOMER_ID} 
                FROM ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME} p 
                WHERE u.${Schema.USER_TABLE_SCHEMA.FIELDS.ID} = p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID}
                    AND u.${Schema.USER_TABLE_SCHEMA.FIELDS.ID} = p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID};`);
    })
    .then(() => {
        return knex.schema.dropTable(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.schema.dropTable(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME);
    });
};