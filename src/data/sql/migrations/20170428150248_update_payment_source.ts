import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID, 36);
            table.string(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID, 36)
                .references(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        }));
    })
    .then(() => {
        return knex.raw(`UPDATE ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME} p 
                    SET ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID} = u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID}, 
                        ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.ID} 
                    FROM ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME} u 
                    JOIN ${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME} b 
                        ON u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID} = b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID} 
                    WHERE p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID} = u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID} 
                        AND p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED} = false 
                        AND p.${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true 
                        AND u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED} = false 
                        AND u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true 
                        AND b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED} = false 
                        AND b.${Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true;`);
    })
    .then(() => {
        return knex.raw(`DELETE FROM ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME}
                        WHERE ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID} IS NULL OR ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID} IS NULL;`);
    })
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID} SET NOT NULL`);
    })
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME} ALTER COLUMN ${Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID} SET NOT NULL`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.CONDO_ID);
            table.dropColumn(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID);
        }));
    });
};