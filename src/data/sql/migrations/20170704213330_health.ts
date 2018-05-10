import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.HEALTH_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.HEALTH_TABLE_SCHEMA.FIELDS.ID, 1).notNullable().primary();
        }));
    })
    .then(() => {
        return knex.raw(`INSERT INTO ${Schema.HEALTH_TABLE_SCHEMA.TABLE_NAME} VALUES ('1');`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.HEALTH_TABLE_SCHEMA.TABLE_NAME);
    });
};