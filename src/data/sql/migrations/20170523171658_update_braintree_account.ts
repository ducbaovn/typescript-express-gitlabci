import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { PAYMENT_GATEWAY } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.renameTable(Schema.BRAINTREE_ACCOUNT_TABLE_SCHEMA.TABLE_NAME, Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME);
        })
        .then(() => {
            return knex.schema.table(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.GATEWAY, 255).notNullable().defaultTo(PAYMENT_GATEWAY.STRIPE);
            }));
        })
        .then(() => {
            return knex.raw(`UPDATE ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME}
                        SET ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.GATEWAY} = '${PAYMENT_GATEWAY.BRAINTREE}';`);
        })
        .then(() => {
            return knex.schema.table(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.renameColumn(Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.BRAINTREE_ACCOUNT_ID, Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.PAYMENT_GATEWAY_ACCOUNT_ID);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
