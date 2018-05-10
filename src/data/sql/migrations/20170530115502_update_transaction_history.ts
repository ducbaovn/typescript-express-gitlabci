import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.boolean(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.PAY_BY_CASH).notNullable().defaultTo(0);
            }));
        })
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
                        ALTER COLUMN ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.BLOCK_ID} DROP NOT NULL;`);
        })
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
                        ALTER COLUMN ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.FLOOR_ID} DROP NOT NULL;`);
        })
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
                        ALTER COLUMN ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID} DROP NOT NULL;`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};
