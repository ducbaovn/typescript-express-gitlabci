import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_MAINPAGE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_MAINPAGE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE).notNullable().defaultTo(0);
                table.boolean(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_LOCATION_ENABLE).notNullable().defaultTo(0);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_ENABLE);
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_ENABLE);
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_SMS_MAINPAGE_ENABLE);
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_PHONE_MAINPAGE_ENABLE);
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_WEBSITE_ENABLE);
                table.dropColumn(Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_LOCATION_ENABLE);
            }));
        });
};
