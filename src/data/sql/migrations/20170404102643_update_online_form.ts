import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";


export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
                table.string(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.UNIT_ID, 36).notNullable().index()
                    .references(Schema.UNIT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        })
        .then(() => {
            return knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
                table.string(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.TRANSACTION_ID, 255).nullable();
            });
        });


};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
            table.dropColumn(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.CONDO_ID}`);
            table.dropColumn(`${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.UNIT_ID}`);
        }),
        knex.schema.table(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
            table.dropColumn(`${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.TRANSACTION_ID}`);
        }),

    ]);
};
