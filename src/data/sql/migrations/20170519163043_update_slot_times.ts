import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID).notNullable().index()
                    .references(Schema.SLOT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
