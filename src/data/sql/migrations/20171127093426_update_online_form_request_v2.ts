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
            table.string(SCHEMA.FIELDS.USER_ID, 36).nullable().index()
                .references(Schema.USER_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.USER_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
            table.string(SCHEMA.FIELDS.CONDO_ID, 36).nullable().index();
            table.string(SCHEMA.FIELDS.UNIT_ID, 36).nullable().index();
            table.float(SCHEMA.FIELDS.PRICE).nullable();
            table.string(SCHEMA.FIELDS.VEHICLE_NUMBER, 255).nullable();
            table.string(SCHEMA.FIELDS.IU_NUMBER, 255).nullable();
            table.string(SCHEMA.FIELDS.PROOF_OF_CAR, 255).nullable();
            table.boolean(SCHEMA.FIELDS.PAY_BY_CASH).nullable().defaultTo(0);
            table.string(SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID, 255).nullable().index()
                .references(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID)
                .inTable(Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME)
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${SCHEMA.TABLE_NAME} a
            SET
            ${SCHEMA.FIELDS.USER_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.USER_ID},
            ${SCHEMA.FIELDS.CONDO_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.CONDO_ID},
            ${SCHEMA.FIELDS.UNIT_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.UNIT_ID},
            ${SCHEMA.FIELDS.PRICE} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.PRICE},
            ${SCHEMA.FIELDS.VEHICLE_NUMBER} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.VEHICLE_NUMBER},
            ${SCHEMA.FIELDS.IU_NUMBER} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.IU_NUMBER},
            ${SCHEMA.FIELDS.PROOF_OF_CAR} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.PROOF_OF_CAR},
            ${SCHEMA.FIELDS.PAY_BY_CASH} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.PAY_BY_CASH},
            ${SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID},
            ${SCHEMA.FIELDS.TRANSACTION_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.TRANSACTION_ID},
            ${SCHEMA.FIELDS.STATUS} =
                CASE
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.NEW}' THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.NEW}'
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.PAID}' AND b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.IS_ENABLE} = false THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED}'
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.NOT_APPLICABLE}' AND b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.IS_ENABLE} = false THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.APPROVED}'
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.PAID}' AND b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.RESOLVED}'
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.NOT_APPLICABLE}' AND b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.IS_ENABLE} = true THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.RESOLVED}'
                    WHEN b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.STATUS} = '${Constants.ONLINE_FORM_STATUS.REJECTED}' THEN '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.REJECTED}'
                    ELSE '${Constants.ONLINE_FORM_REQUEST_ITEM_STATUS.ARCHIVED}'
                END
            FROM ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} b
            WHERE a.${SCHEMA.FIELDS.ONLINE_FORM_REQUEST_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ID};
        `);
    })
    .then(() => {
        return knex.schema.table(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME, function (table) {
            table.string(Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_TEMP_ID, 255).nullable().index();
        });
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME}
            SET ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_TEMP_ID} = ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID}
            WHERE ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_TYPE} = '${Constants.TRANSACTION_ITEM_TYPE.ONLINE_FORM}';
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} a
            SET ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID} = c.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ID}
            FROM ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} b, ${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} c
            WHERE a.${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_TEMP_ID} = b.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ID}
            AND b.${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ID} = c.${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_ID}
            AND a.${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_TYPE} = '${Constants.TRANSACTION_ITEM_TYPE.ONLINE_FORM}';
        `);
    })
    .then(() => {
        return knex.schema.raw(`ALTER TABLE ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN ${Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_TEMP_ID}`);
    })
    .then(() => {
        return knex.schema.raw(`ALTER TABLE ${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN ${Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_REQUEST_ID}`);
    })
    .then(() => {
        return knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
    });
};

export const down = (knex: Knex, promise: typeof Promise): Promise<any> => {
    let SCHEMA = Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA;
    return Promise.all([
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.USER_ID}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.CONDO_ID}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.UNIT_ID}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.PRICE}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.VEHICLE_NUMBER}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.IU_NUMBER}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.PROOF_OF_CAR}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.PAY_BY_CASH}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.PAY_BY_CASH}`),
        knex.schema.raw(`ALTER TABLE ${SCHEMA.TABLE_NAME} DROP COLUMN ${SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID}`),
    ]);
};