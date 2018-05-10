import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.NOTIFICATION_TABLE_SCHEMA.TABLE_NAME} 
                            ALTER COLUMN ${Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.TYPE} TYPE integer USING (type::integer);;`);
        })
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.NOTIFICATION_TABLE_SCHEMA.TABLE_NAME} 
                            ADD ${Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.GROUP_TYPE} VARCHAR(255),
                            ADD ${Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.ITEM_ID} CHAR(36);`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve();
};