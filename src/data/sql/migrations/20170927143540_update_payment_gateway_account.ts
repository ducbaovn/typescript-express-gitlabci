import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME}
                ALTER COLUMN ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY} TYPE TEXT;`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME}
                ALTER COLUMN ${Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.PRIVATE_KEY} TYPE VARCHAR (255);`);
        });
};