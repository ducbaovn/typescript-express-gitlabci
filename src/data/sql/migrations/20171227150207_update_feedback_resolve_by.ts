import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.RESOLVE_BY, 36).index()
            .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
            .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        }));
    })
    .then(() => {
        return knex.raw(`
            UPDATE feedback f SET resolve_by = t.manager_id
            FROM (
                SELECT f1.id, min(m.user_id) manager_id
                FROM feedback f1 JOIN user_manager m ON f1.condo_id = m.condo_id AND m.is_deleted = false
                GROUP BY f1.id
            ) t
            WHERE f.id = t.id;
        `);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};