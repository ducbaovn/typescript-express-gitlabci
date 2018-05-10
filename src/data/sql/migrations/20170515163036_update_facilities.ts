import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.integer(Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY).nullable();
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.SLOT_RESTRICTION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.integer(Schema.SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY).nullable();
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.SLOT_DURATION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.integer(Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY).nullable();
            }));
        });


};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.SLOT_RESTRICTION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY);
            }));
        })
        .then(() => {
            return knex.schema.table(Schema.SLOT_DURATION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.ISO_WEEK_DAY);
            }));
        });
};
