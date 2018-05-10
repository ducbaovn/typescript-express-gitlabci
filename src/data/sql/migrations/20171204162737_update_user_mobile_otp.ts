import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import {ROLE} from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.USER_TABLE_SCHEMA.FIELDS.CONTACT_NUMBER, 100);
        }));
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.USER_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.USER_TABLE_SCHEMA.FIELDS.CONTACT_NUMBER} = ${Schema.USER_TABLE_SCHEMA.FIELDS.PHONE_NUMBER}
            WHERE ${Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID} = '${ROLE.CONDO_MANAGER}';
        `);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.USER_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.USER_TABLE_SCHEMA.FIELDS.CONTACT_NUMBER);
        }));
    });
};