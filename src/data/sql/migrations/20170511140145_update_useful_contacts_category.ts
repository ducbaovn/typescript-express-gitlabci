import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD);
            }));
        })
        .then(() => {
            return knex.raw(`UPDATE ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME} c
                        SET ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD} = t.${Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID}
                        FROM ${Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} t
                        WHERE c.${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.NAME} = t.${Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME}`);
        })
        .then(() => {
            return knex.raw(`DELETE FROM ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}
                        WHERE ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD} IS NULL;`);
        })
        .then(() => {
            return knex.raw(`ALTER TABLE ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME}
                        ALTER COLUMN ${Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD} SET NOT NULL;`);
        });
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.KEYWORD);
            }));
        });
};
