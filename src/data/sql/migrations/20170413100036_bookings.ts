import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { DEPOSIT_STATUS, PAYMENT_STATUS } from "../../../libs/constants";

let paymentStatus = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let categories = [
                {
                    id: PAYMENT_STATUS.NEW,
                    desc: PAYMENT_STATUS.NEW
                },
                {
                    id: PAYMENT_STATUS.ACQUIRED,
                    desc: PAYMENT_STATUS.ACQUIRED
                },
                {
                    id: PAYMENT_STATUS.CANCELLED,
                    desc: PAYMENT_STATUS.CANCELLED
                },
                {
                    id: PAYMENT_STATUS.REFUNDED,
                    desc: PAYMENT_STATUS.REFUNDED
                },
                {
                    id: PAYMENT_STATUS.PENDING,
                    desc: PAYMENT_STATUS.PENDING
                }
            ];

            let operations = [];

            categories.forEach(category => {
                let item = {};

                item[SCHEMA.FIELDS.ID] = category.id;
                item[SCHEMA.FIELDS.DESCRIPTION] = category.desc;

                operations.push(knex(SCHEMA.TABLE_NAME).insert(item));
            });

            return promise.all(operations);
        });
};

let bookingItems = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.BOOKING_ITEM_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.BOOKING_ID).notNullable().index()
                    .references(Schema.BOOKING_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.dateTime(SCHEMA.FIELDS.EVENT_START_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.EVENT_END_DATE).defaultTo(knex.raw("current_timestamp"));
                table.specificType(SCHEMA.FIELDS.START_TIME, "TIME").nullable();
                table.specificType(SCHEMA.FIELDS.END_TIME, "TIME").nullable();
                table.float(SCHEMA.FIELDS.PAYMENT_AMOUNT).defaultTo(0.0);
                table.float(SCHEMA.FIELDS.DEPOSIT_AMOUNT).defaultTo(0.0);

                table.string(SCHEMA.FIELDS.FACILITY_ID).notNullable();
                table.string(SCHEMA.FIELDS.FACILITY_NAME).notNullable();
                table.string(SCHEMA.FIELDS.SLOT_ID).notNullable();
                table.string(SCHEMA.FIELDS.SLOT_NAME).notNullable();
            });
        });
};
let bookings = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.BOOKING_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.dateTime(SCHEMA.FIELDS.EVENT_START_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.EVENT_END_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(SCHEMA.FIELDS.RECEIPT_NO).notNullable();
                table.float(SCHEMA.FIELDS.PAYMENT_AMOUNT).defaultTo(0.0);
                table.float(SCHEMA.FIELDS.DEPOSIT_AMOUNT).defaultTo(0.0);

                table.string(SCHEMA.FIELDS.PAYMENT_STATUS).notNullable().defaultTo(PAYMENT_STATUS.NEW).index()
                    .references(Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.DEPOSIT_STATUS).notNullable().defaultTo(DEPOSIT_STATUS.PENDING);
                table.string(SCHEMA.FIELDS.USER_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.BLOCK_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.FLOOR_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.UNIT_ID, 36).notNullable();
                table.text(SCHEMA.FIELDS.NOTE).nullable();
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        paymentStatus(knex, promise),
        bookings(knex, promise),
        bookingItems(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.BOOKING_TABLE_SCHEMA} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.BOOKING_ITEM_TABLE_SCHEMA} CASCADE`),
    ]);
};
