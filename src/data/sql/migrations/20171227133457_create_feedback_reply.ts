import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.createTable(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME, (table) => {
            table.string(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.text(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CONTENT).nullable();
            table.specificType(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IMAGE_URL, "text[]").nullable();

            table.string(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID, 36).notNullable().index()
                .references(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");

            table.string(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID, 36).notNullable().index()
                .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.CONTENT},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IMAGE_URL},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID},
                ${Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID}
            )
            SELECT
                uuid_generate_v4(),
                false,
                true,
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE},
                null,
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.ID},
                u.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID}
            FROM
                ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} as f
            JOIN (
                SELECT * FROM ${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME} WHERE ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID} IN
                (
                    SELECT DISTINCT
					first_value(${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID}) OVER (PARTITION BY ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID} ORDER BY ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CREATED_DATE} DESC)
					FROM ${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}
					WHERE ${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED} = false
                    ORDER BY 1
                )
            ) as u
            ON f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = u.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID}
            WHERE
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE} IS NOT NULL
                AND f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE} != ''
        `);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.dropTable(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME);
    });
};