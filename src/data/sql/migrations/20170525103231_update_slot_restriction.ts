import * as Bluebird from "bluebird";
import * as Knex from "knex";
import { SLOT_RESTRICTION_TABLE_SCHEMA, SLOT_TIME_TYPE_TABLE_SCHEMA } from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(SLOT_RESTRICTION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID).notNullable().index()
                    .references(SLOT_TIME_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};
