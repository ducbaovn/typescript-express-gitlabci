import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.CONDO_TABLE_SCHEMA.FIELDS.BOOKING_NOTIFICATION_EMAIL, 255).nullable();
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.CONDO_TABLE_SCHEMA.FIELDS.BOOKING_NOTIFICATION_EMAIL);
        }));
    });
};