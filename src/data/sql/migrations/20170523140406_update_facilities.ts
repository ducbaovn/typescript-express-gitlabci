import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
let slotRestriction = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_RESTRICTION_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.RESTRICTION_LEVEL, 36).notNullable();


                table.string(SCHEMA.FIELDS.FACILITY_ID).notNullable().defaultTo("facilityId").index()
                    .references(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.boolean(SCHEMA.FIELDS.BOOKING_NO_LIMIT).notNullable().defaultTo(false);
                table.integer(SCHEMA.FIELDS.BOOKING_QUANTITY).notNullable().defaultTo(0);
                table.string(SCHEMA.FIELDS.BOOKING_RESTRICT_UNIT_ID, 36).index()
                    .references(Schema.SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

let updateFacilities = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.table(SCHEMA.TABLE_NAME, (table => {
                table.string(SCHEMA.FIELDS.SLOT_TYPE_ID, 255).nullable();
                table.string(SCHEMA.FIELDS.DURATION_TYPE, 255).nullable().defaultTo(0);
            }));
        });
};




export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.each([
        slotRestriction(knex, promise),
        updateFacilities(knex, promise)
    ], () => true);

};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};
