import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import {ONLINE_FORM_SUB_CATEGORY} from "../../../libs/constants";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        let carLabelThirdCar = {};
        carLabelThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_THIRD_CAR;
        carLabelThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "third car";
        carLabelThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 3;
        carLabelThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "CarLabel";

        let carLabelTemporary = {};
        carLabelTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_TEMPORARY;
        carLabelTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "temporary";
        carLabelTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 4;
        carLabelTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "CarLabel";

        let carLabelLost = {};
        carLabelLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.CAR_LABEL_LOST_DAMAGE;
        carLabelLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "lost / damage";
        carLabelLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 5;
        carLabelLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "CarLabel";

        let transponderThirdCar = {};
        transponderThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.TRANSPONDER_THIRD_CAR;
        transponderThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "third car";
        transponderThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 3;
        transponderThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "Transponder";

        let transponderLost = {};
        transponderLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.TRANSPONDER_LOST_DAMAGE;
        transponderLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "lost / damage";
        transponderLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 4;
        transponderLost[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "Transponder";

        let iuRegistrationThirdCar = {};
        iuRegistrationThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.IU_REGISTRATION_THIRD_CAR;
        iuRegistrationThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "third car";
        iuRegistrationThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 3;
        iuRegistrationThirdCar[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "IURegistration";

        let iuRegistrationTemporary = {};
        iuRegistrationTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ID] = ONLINE_FORM_SUB_CATEGORY.IU_REGISTRATION_TEMPORARY;
        iuRegistrationTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.NAME] = "temporary";
        iuRegistrationTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY] = 4;
        iuRegistrationTemporary[Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID] = "IURegistration";

        return Promise.all([
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(carLabelThirdCar),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(carLabelTemporary),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(carLabelLost),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(transponderThirdCar),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(transponderLost),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(iuRegistrationThirdCar),
            knex(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME).insert(iuRegistrationTemporary)
        ]);
    })
    .then(() => {
        return knex.schema.table(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.string(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_OWNERSHIP_PHOTO, 255).nullable();
        }));
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.schema.table(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME, (table => {
            table.dropColumn(Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.PROOF_OF_OWNERSHIP_PHOTO);
        }));
    });
};