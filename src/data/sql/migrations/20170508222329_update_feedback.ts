import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve().then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UNIT_ID, 36).notNullable().index()
                .references(Schema.UNIT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};
