import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
             return knex.schema.table(Schema.BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_TYPE_ID).nullable();
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve(true);
};
