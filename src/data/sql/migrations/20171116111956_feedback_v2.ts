import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import { FEEDBACK_STATUS } from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`DROP INDEX feedback_feedback_category_id_index;`);
    })
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropForeign([Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID]);
            table.renameColumn(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_TEMPLATE_ID);
        }));
    })
    .then(() => {
        return knex.schema.renameTable(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME, Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropPrimary("feedback_category_pkey");
            table.primary([Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID]);
        }));
    })
    .then(() => {
        return knex.schema.createTable(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID, 36).notNullable().primary();
            table.boolean(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
            table.boolean(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
            table.dateTime(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
            table.dateTime(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

            table.string(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
            .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
            .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
            .onUpdate("CASCADE")
            .onDelete("CASCADE");

            table.string(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME).notNullable();
            table.string(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.EMAIL);
            table.integer(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX);
        }));
    })
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID, 36).index()
            .references(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
            .inTable(Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        }));
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.EMAIL},
                ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ORDER_INDEX}
            )
            SELECT
                uuid_generate_v4(),
                false,
                true,
                now(),
                now(),
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID},
                c.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME},
                null,
                c.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ORDER_INDEX}
            FROM ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} f
            JOIN ${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} c
                ON f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_TEMPLATE_ID} = c.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID}
            WHERE f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} is not null
            GROUP BY f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID}, c.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID};
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME} f
            SET ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID} = c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
            FROM ${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} t
            JOIN ${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME} c
                ON c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.NAME} = t.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME}
            WHERE
                f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_TEMPLATE_ID} = t.${Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID}
                AND f.${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID} = c.${Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID};
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS} = '${FEEDBACK_STATUS.PENDING}'
            WHERE ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true;
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME}
            SET
                ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS} = '${FEEDBACK_STATUS.RESOLVED}',
                ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true
            WHERE ${Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_ENABLE} = false;
        `);
    })
    .then(() => {
        return knex.schema.dropTable(Schema.FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME);
    })
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_TEMPLATE_ID);
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};