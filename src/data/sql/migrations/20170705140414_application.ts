import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { PLATFORM } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.APPLICATION_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.string(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.PLATFORM).notNullable().defaultTo(PLATFORM.IOS);
            table.integer(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.VERSION).notNullable().defaultTo(100);
            table.boolean(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.IS_LATEST).notNullable().defaultTo(1);
            table.boolean(Schema.APPLICATION_TABLE_SCHEMA.FIELDS.FORCE_UPDATE).notNullable().defaultTo(0);
        }));
    })
    .then(() => {
        return knex.raw(`INSERT INTO ${Schema.APPLICATION_TABLE_SCHEMA.TABLE_NAME} VALUES 
                        (uuid_generate_v4(), false, true, now(), now(), '${PLATFORM.IOS}', 1, true, false), 
                        (uuid_generate_v4(), false, true, now(), now(), '${PLATFORM.ANDROID}', 1, true, false);`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.HEALTH_TABLE_SCHEMA.TABLE_NAME);
    });
};