import * as Bluebird from "bluebird";
import * as Knex from "knex";
import { SLOT_SUSPENSION_TABLE_SCHEMA, FACILITIES_TABLE_SCHEMA, SLOT_TABLE_SCHEMA } from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let FIELDS = SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTableIfNotExists(SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(FIELDS.ID, 36).notNullable().primary();
                table.boolean(FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(FIELDS.TARGET_ID, 36).notNullable().index();
                table.dateTime(FIELDS.START_TIME).notNullable();
                table.dateTime(FIELDS.END_TIME).notNullable();
                table.string(FIELDS.FACILITY_ID, 36).notNullable().index()
                    .references(FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.string(FIELDS.SLOT_ID, 36).notNullable().index()
                    .references(SLOT_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(SLOT_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.text(FIELDS.NOTE);
            }));
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        });
};
