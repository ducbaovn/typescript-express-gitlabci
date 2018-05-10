import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.createTable(Schema.NOTIFICATION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.string(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TYPE, 255);
                table.string(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TITLE, 255);
                table.text(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.BODY);
                table.string(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.CLICK_ACTION, 255);
                table.boolean(Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.IS_READ).notNullable().defaultTo(false);
            }));
        })
        .then(() => {
            return knex.raw(`CREATE INDEX ON ${Schema.SMS_TABLE_SCHEMA.TABLE_NAME} (${Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID})`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.dropTable(Schema.NOTIFICATION_TABLE_SCHEMA.TABLE_NAME);
        });
};