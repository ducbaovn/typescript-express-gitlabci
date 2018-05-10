import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";
import {
    FACILITIES_TYPE,
    FREQUENCY_RESTRICTION_TYPE,
    FREQUENCY_RESTRICTION_TYPE_ITEM,
    SLOT_DURATION_TYPE,
    SLOT_RESTRICTION,
    SLOT_TIME_ITEM,
    SLOT_TIME_TYPE,
    SLOT_TYPE
} from "../../../libs/constants";

let slotRestrictionType = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_RESTRICTION_TYPE_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let user = {};
            user[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_USER;
            user[SCHEMA.FIELDS.DESCRIPTION] = "Many times an user can book per period";

            let unit = {};
            unit[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_UNIT;
            unit[SCHEMA.FIELDS.DESCRIPTION] = "Many times an unit can book per period";

            let floor = {};
            floor[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_FLOOR;
            floor[SCHEMA.FIELDS.DESCRIPTION] = "Many times a floor can book per period";

            let stack = {};
            stack[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_STACK;
            stack[SCHEMA.FIELDS.DESCRIPTION] = "Many times a stack can book per period";

            let block = {};
            block[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_BLOCK;
            block[SCHEMA.FIELDS.DESCRIPTION] = "Many times a block can book per period";

            let condo = {};
            condo[SCHEMA.FIELDS.ID] = SLOT_RESTRICTION.LEVEL_CONDO;
            condo[SCHEMA.FIELDS.DESCRIPTION] = "Many times a condo can book per period";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(user),
                knex(SCHEMA.TABLE_NAME).insert(unit),
                knex(SCHEMA.TABLE_NAME).insert(floor),
                knex(SCHEMA.TABLE_NAME).insert(stack),
                knex(SCHEMA.TABLE_NAME).insert(block),
                knex(SCHEMA.TABLE_NAME).insert(condo),
            ]);
        });
};

let slotDurationType = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let hourly = {};
            hourly[SCHEMA.FIELDS.ID] = SLOT_DURATION_TYPE.HOURLY;
            hourly[SCHEMA.FIELDS.DESCRIPTION] = "Hourly";

            let halfHourly = {};
            halfHourly[SCHEMA.FIELDS.ID] = SLOT_DURATION_TYPE.HALF_HOURLY;
            halfHourly[SCHEMA.FIELDS.DESCRIPTION] = "Half Hourly";

            let custom = {};
            custom[SCHEMA.FIELDS.ID] = SLOT_DURATION_TYPE.CUSTOM;
            custom[SCHEMA.FIELDS.DESCRIPTION] = "Custom";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(hourly),
                knex(SCHEMA.TABLE_NAME).insert(halfHourly),
                knex(SCHEMA.TABLE_NAME).insert(custom),
            ]);
        });
};

let slotType = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_TYPE_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let normal = {};
            normal[SCHEMA.FIELDS.ID] = SLOT_TYPE.NORMAL_HOURS;
            normal[SCHEMA.FIELDS.DESCRIPTION] = "Normal hours";

            let peek = {};
            peek[SCHEMA.FIELDS.ID] = SLOT_TYPE.PEAK;
            peek[SCHEMA.FIELDS.DESCRIPTION] = "Peak Hours";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(normal),
                knex(SCHEMA.TABLE_NAME).insert(peek),
            ]);
        });
};

let slotTimeType = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_TIME_TYPE_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let normal = {};
            normal[SCHEMA.FIELDS.ID] = SLOT_TIME_TYPE.NORMAL_HOURS;
            normal[SCHEMA.FIELDS.DESCRIPTION] = "Normal hours";

            let peak = {};
            peak[SCHEMA.FIELDS.ID] = SLOT_TIME_TYPE.PEAK;
            peak[SCHEMA.FIELDS.DESCRIPTION] = "Peak";

            let offpeak = {};
            offpeak[SCHEMA.FIELDS.ID] = SLOT_TIME_TYPE.OFF_PEAK;
            offpeak[SCHEMA.FIELDS.DESCRIPTION] = "Off-Peak";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(normal),
                knex(SCHEMA.TABLE_NAME).insert(peak),
                knex(SCHEMA.TABLE_NAME).insert(offpeak),
            ]);
        });
};

let slotTimeItemsTemplate = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.SLOT_TYPE_ID).notNullable().index()
                    .references(Schema.SLOT_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.string(SCHEMA.FIELDS.SLOT_TIME_TYPE_ID).notNullable().index()
                    .references(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(true);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let normalHours = {};
            normalHours[SCHEMA.FIELDS.ID] = SLOT_TIME_ITEM.ITEM_NORMAL_HOURS;
            normalHours[SCHEMA.FIELDS.NAME] = "Normal Hours";
            normalHours[SCHEMA.FIELDS.SLOT_TYPE_ID] = SLOT_TYPE.NORMAL_HOURS;
            normalHours[SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = SLOT_TIME_TYPE.NORMAL_HOURS;
            normalHours[SCHEMA.FIELDS.PRIORITY] = 1;
            normalHours[SCHEMA.FIELDS.DESCRIPTION] = "Normal hours";

            let peak1 = {};
            peak1[SCHEMA.FIELDS.ID] = SLOT_TIME_ITEM.ITEM_PEAK_1;
            peak1[SCHEMA.FIELDS.NAME] = "Peak 1";
            peak1[SCHEMA.FIELDS.SLOT_TYPE_ID] = SLOT_TYPE.PEAK;
            peak1[SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = SLOT_TIME_TYPE.PEAK;
            peak1[SCHEMA.FIELDS.PRIORITY] = 2;
            peak1[SCHEMA.FIELDS.DESCRIPTION] = "Peek Hours";

            let peak2 = {};
            peak2[SCHEMA.FIELDS.ID] = SLOT_TIME_ITEM.ITEM_PEAK_2;
            peak2[SCHEMA.FIELDS.NAME] = "Peak 2";
            peak2[SCHEMA.FIELDS.SLOT_TYPE_ID] = SLOT_TYPE.PEAK;
            peak2[SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = SLOT_TIME_TYPE.PEAK;
            peak2[SCHEMA.FIELDS.PRIORITY] = 3;
            peak2[SCHEMA.FIELDS.DESCRIPTION] = "Peek Hours";

            let offPeak1 = {};
            offPeak1[SCHEMA.FIELDS.ID] = SLOT_TIME_ITEM.ITEM_OFF_PEAK_1;
            offPeak1[SCHEMA.FIELDS.NAME] = "Off-Peak 1";
            offPeak1[SCHEMA.FIELDS.SLOT_TYPE_ID] = SLOT_TYPE.PEAK;
            offPeak1[SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = SLOT_TIME_TYPE.OFF_PEAK;
            offPeak1[SCHEMA.FIELDS.PRIORITY] = 4;
            offPeak1[SCHEMA.FIELDS.DESCRIPTION] = "Peek Hours: Off-Peak";

            let offPeak2 = {};
            offPeak2[SCHEMA.FIELDS.ID] = SLOT_TIME_ITEM.ITEM_OFF_PEAK_2;
            offPeak2[SCHEMA.FIELDS.NAME] = "Off-Peak 2";
            offPeak2[SCHEMA.FIELDS.SLOT_TYPE_ID] = SLOT_TYPE.PEAK;
            offPeak2[SCHEMA.FIELDS.SLOT_TIME_TYPE_ID] = SLOT_TIME_TYPE.OFF_PEAK;
            offPeak2[SCHEMA.FIELDS.PRIORITY] = 5;
            offPeak2[SCHEMA.FIELDS.DESCRIPTION] = "Peek Hours: Off-Peak";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(normalHours),
                knex(SCHEMA.TABLE_NAME).insert(peak1),
                knex(SCHEMA.TABLE_NAME).insert(peak2),
                knex(SCHEMA.TABLE_NAME).insert(offPeak1),
                knex(SCHEMA.TABLE_NAME).insert(offPeak2),
            ]);
        });
};

let facilityTypes = (knex: Knex, promise: typeof Bluebird) => {
    let SCHEMA = Schema.FACILITY_TYPE_TABLE_SCHEMA;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
                table.string(SCHEMA.FIELDS.ID).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let item1 = {};
            item1[SCHEMA.FIELDS.ID] = FACILITIES_TYPE.BBQ;
            item1[SCHEMA.FIELDS.NAME] = "BBQ";
            item1[SCHEMA.FIELDS.PRIORITY] = 1;
            item1[SCHEMA.FIELDS.DESCRIPTION] = "BBQ";

            let item2 = {};
            item2[SCHEMA.FIELDS.ID] = FACILITIES_TYPE.FUNCTION_ROOM;
            item2[SCHEMA.FIELDS.NAME] = "Function Room";
            item2[SCHEMA.FIELDS.PRIORITY] = 2;
            item2[SCHEMA.FIELDS.DESCRIPTION] = "Function Room";

            let item3 = {};
            item3[SCHEMA.FIELDS.ID] = FACILITIES_TYPE.READING_ROOM;
            item3[SCHEMA.FIELDS.NAME] = "Reading Room";
            item3[SCHEMA.FIELDS.PRIORITY] = 3;
            item3[SCHEMA.FIELDS.DESCRIPTION] = "Reading Room";

            let item4 = {};
            item4[SCHEMA.FIELDS.ID] = FACILITIES_TYPE.SQUASH;
            item4[SCHEMA.FIELDS.NAME] = "Squash";
            item4[SCHEMA.FIELDS.PRIORITY] = 4;
            item4[SCHEMA.FIELDS.DESCRIPTION] = "Squash";

            let item5 = {};
            item5[SCHEMA.FIELDS.ID] = FACILITIES_TYPE.TENNIS;
            item5[SCHEMA.FIELDS.NAME] = "Tennis";
            item5[SCHEMA.FIELDS.PRIORITY] = 5;
            item5[SCHEMA.FIELDS.DESCRIPTION] = "Tennis";

            return promise.all([
                knex(SCHEMA.TABLE_NAME).insert(item1),
                knex(SCHEMA.TABLE_NAME).insert(item2),
                knex(SCHEMA.TABLE_NAME).insert(item3),
                knex(SCHEMA.TABLE_NAME).insert(item4),
                knex(SCHEMA.TABLE_NAME).insert(item5),
            ]);
        });
};

let facilities = (knex: Knex, promise: typeof Bluebird) => {
    let SCHEMA = Schema.FACILITIES_TABLE_SCHEMA;
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

                // table.string(SCHEMA.FIELDS.FACILITY_TYPE_ID, 36).notNullable().index()
                //     .references(Schema.FACILITY_TYPE_TABLE_SCHEMA.FIELDS.ID)
                //     .inTable(Schema.FACILITY_TYPE_TABLE_SCHEMA.TABLE_NAME)
                //     .onUpdate("CASCADE")
                //     .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.NAME).notNullable();
                table.string(SCHEMA.FIELDS.DESCRIPTION);
                table.string(SCHEMA.FIELDS.ICON_URL);

                table.string(SCHEMA.FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.integer(SCHEMA.FIELDS.PRIORITY).notNullable().defaultTo(0);
            });
        });
};

let slotTimes = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_TIME_TABLE_SCHEMA;
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

                table.string(SCHEMA.FIELDS.FACILITY_ID).notNullable().index()
                    .references(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.DURATION_TYPE, 36).notNullable().index()
                    .references(Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

let slotTimeItems = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_TIME_ITEM_TABLE_SCHEMA;
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

                table.string(SCHEMA.FIELDS.SLOT_TIME_ID).notNullable().index()
                    .references(Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.ITEM_NAME_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.SLOT_TYPE_ID, 36).notNullable();
                table.string(SCHEMA.FIELDS.SLOT_TIME_TYPE_ID, 36).notNullable();
                table.specificType(SCHEMA.FIELDS.START_TIME, "TIME").nullable();
                table.specificType(SCHEMA.FIELDS.END_TIME, "TIME").nullable();
            });
        });
};

let slotRules = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_RULES_TABLE_SCHEMA;
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

                // Reference to Facility
                table.string(SCHEMA.FIELDS.FACILITY_ID).notNullable().index()
                    .references(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.integer(SCHEMA.FIELDS.SLOT_AVAILABLE_ADVANCE).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.CAN_NOT_CANCEL).notNullable().defaultTo(0);
                table.float(SCHEMA.FIELDS.CANCELLATION_MINUTES).notNullable().defaultTo(0);
                table.float(SCHEMA.FIELDS.CANCELLATION_HOURS).notNullable().defaultTo(0);
                table.float(SCHEMA.FIELDS.CANCELLATION_DAYS).notNullable().defaultTo(0);
                table.decimal(SCHEMA.FIELDS.PAYMENT_AMOUNT).notNullable().defaultTo(0);
                table.decimal(SCHEMA.FIELDS.DEPOSIT_AMOUNT).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.TERM_CONDITION_URL).notNullable();
            });
        });
};

let slots = (knex: Knex, promise: typeof Bluebird) => {
    let SCHEMA = Schema.SLOT_TABLE_SCHEMA;
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

                table.string(SCHEMA.FIELDS.NAME).notNullable();

                // Reference to Facility
                table.string(SCHEMA.FIELDS.FACILITY_ID, 36).notNullable().index()
                    .references(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                // Reference to Slot type
                table.string(SCHEMA.FIELDS.SLOT_TYPE_ID, 36).notNullable().index()
                    .references(Schema.SLOT_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                // Reference to Slot rule.
                table.string(SCHEMA.FIELDS.SLOT_RULE_ID, 36).notNullable().index()
                    .references(Schema.SLOT_RULES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_RULES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");


                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        });
};

let slotDurations = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_DURATION_TABLE_SCHEMA;
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

                table.string(SCHEMA.FIELDS.FACILITY_ID).notNullable().index()
                    .references(Schema.FACILITIES_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.SLOT_TIME_ID, 36).notNullable().index()
                    .references(Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.SLOT_TYPE_ID, 36).notNullable().index()
                    .references(Schema.SLOT_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(SCHEMA.FIELDS.SLOT_TIME_TYPE_ID, 36).notNullable().index()
                    .references(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.specificType(SCHEMA.FIELDS.START_TIME, "TIME").nullable();
                table.specificType(SCHEMA.FIELDS.END_TIME, "TIME").nullable();
            });
        });
};

let slotFrequencyRestrictionTable = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let SCHEMA = Schema.SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA;

    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTable(SCHEMA.TABLE_NAME, (table) => {
                table.string(SCHEMA.FIELDS.ID, 36).notNullable().primary();
                table.boolean(SCHEMA.FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(SCHEMA.FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(SCHEMA.FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(SCHEMA.FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(SCHEMA.FIELDS.NAME, 255).notNullable();
                table.string(SCHEMA.FIELDS.TYPE, 255).notNullable();
                table.integer(SCHEMA.FIELDS.CONDITION_INTERVAL).notNullable().defaultTo(0);
                table.text(SCHEMA.FIELDS.DESCRIPTION).nullable();
            });
        })
        .then(() => {
            let insList = [];
            let recordsDefault: any[] = [
                {
                    id: FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_WEEK,
                    name: "No of times a week",
                    type: FREQUENCY_RESTRICTION_TYPE.WEEK,
                    conditionInterval: 0,
                    desc: "Restrict the number of times a week. [Current week]"
                },
                {
                    id: FREQUENCY_RESTRICTION_TYPE_ITEM.TWO_WEEKS,
                    name: "No of times 2 weeks",
                    type: FREQUENCY_RESTRICTION_TYPE.WEEK,
                    conditionInterval: 1,
                    desc: "Restrict the number of times every 2 weeks. Past(restrictType)(week) - Current(week) - Future(week)(restrictType)"
                },
                {
                    id: FREQUENCY_RESTRICTION_TYPE_ITEM.THREE_WEEKS,
                    name: "No of times 3 weeks",
                    type: FREQUENCY_RESTRICTION_TYPE.WEEK,
                    conditionInterval: 2,
                    desc: "Restrict the number of times every 3 weeks. Past(restrictType)(week) - Current(week) - Future(week)(restrictType)"
                },
                {
                    id: FREQUENCY_RESTRICTION_TYPE_ITEM.ONE_MONTH,
                    name: "No of times a month",
                    type: FREQUENCY_RESTRICTION_TYPE.MONTH,
                    conditionInterval: 0,
                    desc: "Restrict the number of times a month. [Current month]"
                }
            ];

            recordsDefault.forEach(item => {
                let obj = {};

                obj[SCHEMA.FIELDS.ID] = item.id;
                obj[SCHEMA.FIELDS.NAME] = item.name;
                obj[SCHEMA.FIELDS.TYPE] = item.type;
                obj[SCHEMA.FIELDS.CONDITION_INTERVAL] = item.conditionInterval;
                obj[SCHEMA.FIELDS.DESCRIPTION] = item.desc;

                insList.push(knex(SCHEMA.TABLE_NAME).insert(obj));
            });

            return promise.all(insList);
        });
};

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

                // table.string(SCHEMA.FIELDS.SLOT_RULE_ID, 36).notNullable().index()
                //     .references(Schema.SLOT_RULES_TABLE_SCHEMA.FIELDS.ID)
                //     .inTable(Schema.SLOT_RULES_TABLE_SCHEMA.TABLE_NAME)
                //     .onUpdate("CASCADE")
                //     .onDelete("CASCADE");

                // table.string(SCHEMA.FIELDS.SLOT_TIME_TYPE_ID).notNullable().defaultTo("unit").index()
                //     .references(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.FIELDS.ID)
                //     .inTable(Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME)
                //     .onUpdate("CASCADE")
                //     .onDelete("CASCADE");

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

export const up = (knex: Knex, promise: typeof Bluebird) => {
    return promise.each([
        slotRestrictionType(knex, promise),
        slotDurationType(knex, promise),
        slotType(knex, promise),
        slotTimeType(knex, promise),
        slotTimeItemsTemplate(knex, promise),
        facilityTypes(knex, promise),
        facilities(knex, promise),
        slotTimes(knex, promise),
        slots(knex, promise),
        slotTimeItems(knex, promise),
        slotRules(knex, promise),
        slotDurations(knex, promise),
        slotFrequencyRestrictionTable(knex, promise),
        slotRestriction(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird) => {
    return promise.all([
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_RESTRICTION_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FACILITY_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_RULES_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_DURATION_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
        knex.schema.raw(`DROP TABLE IF EXISTS ${Schema.SLOT_RESTRICTION_TABLE_SCHEMA.TABLE_NAME} CASCADE`),
    ]);
};
