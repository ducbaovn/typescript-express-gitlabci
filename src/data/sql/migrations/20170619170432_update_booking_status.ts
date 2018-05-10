import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { PAYMENT_STATUS } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME, table => {
            table.dropForeign([Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS]);
        });
    })
    .then(() => {
        return knex.schema.dropTable(Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS} = '${PAYMENT_STATUS.NOT_APPLICABLE}'
            WHERE ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS} = '${PAYMENT_STATUS.ACQUIRED}'
                AND ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT} = 0;
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS} = '${PAYMENT_STATUS.PAID}'
            WHERE ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_STATUS} = '${PAYMENT_STATUS.ACQUIRED}'
                AND ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.PAYMENT_AMOUNT} > 0;
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_STATUS} = '${PAYMENT_STATUS.NOT_APPLICABLE}'
            WHERE ${Schema.BOOKING_TABLE_SCHEMA.FIELDS.DEPOSIT_AMOUNT} = 0;
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${PAYMENT_STATUS.NOT_APPLICABLE}'
            WHERE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${PAYMENT_STATUS.ACQUIRED}'
                AND ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.TOTAL} = 0;
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${PAYMENT_STATUS.PAID}'
            WHERE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${PAYMENT_STATUS.ACQUIRED}'
                AND ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.TOTAL} > 0;
        `);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};