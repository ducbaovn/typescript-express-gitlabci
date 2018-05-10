import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.PHONE_NUMBER_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.boolean(Schema.PHONE_NUMBER_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.PHONE_NUMBER_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.boolean(Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.PHONE_NUMBER_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.PHONE_NUMBER_TABLE_SCHEMA.FIELDS.IS_DELETED);
                table.dropColumn(Schema.PHONE_NUMBER_TABLE_SCHEMA.FIELDS.IS_ENABLE);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_DELETED);
                table.dropColumn(Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE);
            }));
        });
};
