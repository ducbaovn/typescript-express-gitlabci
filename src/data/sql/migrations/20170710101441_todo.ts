import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${ Schema.TODO_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(Schema.TODO_SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(Schema.TODO_SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(Schema.TODO_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(Schema.TODO_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(Schema.TODO_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(Schema.TODO_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.string(Schema.TODO_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                    .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(Schema.TODO_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.text(Schema.TODO_SCHEMA.FIELDS.CONTENT).notNullable();
            });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${ Schema.TODO_SCHEMA.TABLE_NAME} CASCADE`);
        });
};
