import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOME_USER_ROLE, 255).nullable().defaultTo("");
            table.string(Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL_CONTACT, 100).nullable().defaultTo("");
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.USER_TABLE_SCHEMA.FIELDS.CUSTOME_USER_ROLE);
            table.dropColumn(Schema.USER_TABLE_SCHEMA.FIELDS.EMAIL_CONTACT);
        }));
    });
};