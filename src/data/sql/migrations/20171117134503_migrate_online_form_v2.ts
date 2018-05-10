import * as Promise from "bluebird";
import * as Knex from "knex";
import * as momentTz from "moment-timezone";
import * as Schema from "../schema";
import * as Constants from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Promise): Promise<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.NAME},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.TC_URL},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID},
                ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID}
            )
            SELECT
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.NAME},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.TC_URL},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CONDO_ID},
                ${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID}
            FROM ${Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME} ;
        `);
    })
    .then(() => {
        return knex.raw(`SELECT * FROM ${Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME}`)
        .then(result => {
            let categoryItems = [];
            for (let category of result.rows) {
                if (category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] === Constants.ONLINE_FORM.ACCESS_CARD) {
                    categoryItems.push({
                        isDeleted: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED],
                        isEnable: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE],
                        createdDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE],
                        updatedDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE],
                        condoId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID],
                        name: "new card",
                        onlineFormSubCategoryTemplateId: Constants.ONLINE_FORM_SUB_CATEGORY.NEW_CARD,
                        onlineFormCategoryId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID],
                    });
                } else if (category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] === Constants.ONLINE_FORM.BICYCLE_TAG) {
                    categoryItems.push({
                        isDeleted: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED],
                        isEnable: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE],
                        createdDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE],
                        updatedDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE],
                        condoId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID],
                        name: "no type",
                        onlineFormSubCategoryTemplateId: Constants.ONLINE_FORM_SUB_CATEGORY.NO_TYPE,
                        onlineFormCategoryId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID],
                    });
                } else if (category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] === Constants.ONLINE_FORM.CAR_LABEL) {
                    categoryItems.push({
                        isDeleted: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED],
                        isEnable: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE],
                        createdDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE],
                        updatedDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE],
                        condoId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID],
                        name: "first car",
                        onlineFormSubCategoryTemplateId: Constants.ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_FIRST_CAR,
                        onlineFormCategoryId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID],
                    });
                } else if (category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] === Constants.ONLINE_FORM.IU_REGISTRATION) {
                    categoryItems.push({
                        isDeleted: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED],
                        isEnable: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE],
                        createdDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE],
                        updatedDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE],
                        condoId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID],
                        name: "first car",
                        onlineFormSubCategoryTemplateId: Constants.ONLINE_FORM_SUB_CATEGORY.IU_REGISTRATION_FIRST_CAR,
                        onlineFormCategoryId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID],
                    });
                } else if (category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] === Constants.ONLINE_FORM.TRANSPONDER) {
                    categoryItems.push({
                        isDeleted: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED],
                        isEnable: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE],
                        createdDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE],
                        updatedDate: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE],
                        condoId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID],
                        name: "first car",
                        onlineFormSubCategoryTemplateId: Constants.ONLINE_FORM_SUB_CATEGORY.TRANSPONDER_FIRST_CAR,
                        onlineFormCategoryId: category[Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.ID],
                    });
                }
            }

            let rows = [];
            for (let item of categoryItems) {
                rows.push(`(
                    uuid_generate_v4(),
                    '${item.isDeleted}',
                    '${item.isEnable}',
                    now(),
                    now(),
                    '${item.condoId}',
                    '${item.name}',
                    '${item.onlineFormSubCategoryTemplateId}',
                    '${item.onlineFormCategoryId}'
                )`);
            }
            let data = rows.join(",");
            if (data) {
                let query = `
                    INSERT INTO ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME} (
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID},
                        ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID}
                    )
                    VALUES ${data} ;
                `;
                return knex.raw(query);
            } else {
                return null;
            }
        });
    })
    .then(() => {
        return knex.raw(`
            INSERT INTO ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME} (
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ID},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.IS_DELETED},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.IS_ENABLE},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.CREATED_DATE},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.UPDATED_DATE},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID},
                ${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.PRICE}
            )
            SELECT
                uuid_generate_v4(),
                false,
                true,
                now(),
                now(),
                sub.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID},
                form.${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.PRICE}
            FROM ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME} sub
            JOIN ${Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME} form
            ON sub.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID} = form.${Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ID};
        `);
    })
    .then(() => {
        return knex.raw(`
            UPDATE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} request
            SET
                ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID} = sub.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}
            FROM ${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME} sub
            WHERE
                request.${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ONLINE_FORM_ID} = sub.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID}
        `);
    })
    .then(() => {
        return knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
    })
    .then(() => {
        return knex.raw(`ALTER TABLE ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME} DROP COLUMN ${Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.FIELDS.ONLINE_FORM_ID}`);
    });
};
export const down = (knex: Knex, promise: typeof Promise): Promise<any> => {
    return promise.resolve();
};