import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import {ROLE, STATUS_REQUEST_USER} from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID, 36).notNullable().index()
                .references(Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID, 36).notNullable().index()
                .references(Schema.UNIT_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.UNIT_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID, 36).notNullable();
            table.boolean(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT).notNullable().defaultTo(0);
        }));
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}
            )
            SELECT
                uuid_generate_v4(),
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID} as ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID},
                '${ROLE.OWNER}',
                true
            FROM ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} as a, ${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME} as u, ${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME} as f, ${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME} as b
            WHERE
                u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID} = f.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}
                AND f.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID} = b.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}
                AND a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CONDO_ID} = b.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}
                AND a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_TARGETED} = false
            GROUP BY a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID}, u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}
        ;`);
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}
            )
            SELECT
                uuid_generate_v4(),
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID} as ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID},
                '${ROLE.TENANT}',
                true
            FROM ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} as a, ${Schema.UNIT_TABLE_SCHEMA.TABLE_NAME} as u, ${Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME} as f, ${Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME} as b
            WHERE
                u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID} = f.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.ID}
                AND f.${Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID} = b.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.ID}
                AND a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CONDO_ID} = b.${Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID}
                AND a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_TARGETED} = false
            GROUP BY a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID}, u.${Schema.UNIT_TABLE_SCHEMA.FIELDS.ID}
        ;`);
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID},
                ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}
            )
            SELECT
                uuid_generate_v4(),
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_DELETED},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID} as ${Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID},
                u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID},
                u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID},
                u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}
            FROM ${Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.TABLE_NAME} as au
            JOIN ${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME} as a
                ON a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID} = au.${Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID}
            JOIN ${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME} as u
                ON au.${Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.FIELDS.USER_ID} = u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID}
            WHERE a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_TARGETED} = true
                AND u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS} = '${STATUS_REQUEST_USER.APPROVE}'
            GROUP BY a.${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.ID}, u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID}, u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.ROLE_ID}, u.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_RESIDENT}
        ;`);
    })
    .then(() => {
        return knex.schema.table(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME}`, function (table) {
            table.dropColumn(`${Schema.ANNOUNCEMENT_TABLE_SCHEMA.FIELDS.IS_TARGETED}`);
        });
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME);
    });
};