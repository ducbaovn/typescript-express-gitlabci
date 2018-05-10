import * as Promise from "bluebird";
import * as Knex from "knex";
import * as UUID from "uuid";
import * as Schema from "../schema";
import * as Constants from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Promise): Promise<any> => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.schema.table(SCHEMA.TABLE_NAME, function (table) {
            table.string(SCHEMA.FIELDS.STATUS, 255).nullable().index();
        });
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${SCHEMA.TABLE_NAME} a
            SET ${SCHEMA.FIELDS.STATUS} =
                CASE b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS}
                    WHEN '${Constants.ONLINE_FORM_STATUS.NEW}' THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.NEW}'
                    WHEN '${Constants.ONLINE_FORM_STATUS.PAID}' THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.ACTIVE}'
                    WHEN '${Constants.ONLINE_FORM_STATUS.NOT_APPLICABLE}' THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.ACTIVE}'
                    ELSE '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.ARCHIVED}'
                END
            FROM ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} b
            WHERE a.${SCHEMA.FIELDS.ONLINE_FORM_REQUEST_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ID};
        `);
    });
};

export const down = (knex: Knex, promise: typeof Promise): Promise<any> => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA;
    return promise.resolve()
    .then(() => {
        return knex.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.STATUS}`);
    });
};