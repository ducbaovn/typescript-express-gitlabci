import * as Bluebird from "bluebird";
import * as Knex from "knex";
import { CLUSTERING_CONDO_TABLE_SCHEMA, CLUSTERING_TABLE_SCHEMA, CLUSTERING_TYPE_TABLE_SCHEMA, CLUSTERING_MEMBERS_TABLE_SCHEMA, CONDO_TABLE_SCHEMA } from "../schema";
import { CLUSTERING_TYPE } from "../../../libs/constants";

const clusteringType = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let FIELDS = CLUSTERING_TYPE_TABLE_SCHEMA.FIELDS;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${CLUSTERING_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTableIfNotExists(CLUSTERING_TYPE_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(FIELDS.ID, 20).notNullable().primary();
                table.text(FIELDS.DESCRIPTION);
            }));
        })
        .then(() => {
            let categories: any[] = [
                {
                    id: CLUSTERING_TYPE.ALL,
                    desc: "Share all conversation"
                },
                {
                    id: CLUSTERING_TYPE.CHATTER_BOX,
                    desc: "Share chatter box's conversation"
                },
                {
                    id: CLUSTERING_TYPE.GARAGE_SALE,
                    desc: "Share garage sale's conversation"
                },
                {
                    id: CLUSTERING_TYPE.FIND_A_BUDDY,
                    desc: "Share find a buddy's conversation"
                },
            ];

            let operations: any[] = [];

            categories.forEach((category: any) => {
                let item: any = {};
                item[FIELDS.ID] = category.id;
                item[FIELDS.DESCRIPTION] = category.desc;

                operations.push(knex(CLUSTERING_TYPE_TABLE_SCHEMA.TABLE_NAME).insert(item));
            });

            return promise.all(operations);
        });
};

const clustering = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let FIELDS = CLUSTERING_TABLE_SCHEMA.FIELDS;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${CLUSTERING_CONDO_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${CLUSTERING_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTableIfNotExists(CLUSTERING_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.string(FIELDS.ID, 36).notNullable().primary();
                table.boolean(FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(FIELDS.NAME, 255).notNullable().index();
                table.string(FIELDS.TYPE, 20).notNullable().index()
                    .references(CLUSTERING_TYPE_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(CLUSTERING_TYPE_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            }));
        });
};

const clusteringMembers = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    let FIELDS = CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS;
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${CLUSTERING_MEMBERS_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        })
        .then(() => {
            return knex.schema.createTableIfNotExists(CLUSTERING_MEMBERS_TABLE_SCHEMA.TABLE_NAME, (table) => {
                table.string(FIELDS.ID, 36).notNullable().primary();
                table.boolean(FIELDS.IS_DELETED).notNullable().defaultTo(0);
                table.boolean(FIELDS.IS_ENABLE).notNullable().defaultTo(1);
                table.dateTime(FIELDS.CREATED_DATE).defaultTo(knex.raw("current_timestamp"));
                table.dateTime(FIELDS.UPDATED_DATE).defaultTo(knex.raw("current_timestamp"));

                table.string(FIELDS.CLUSTERING_ID, 36).notNullable().index()
                    .references(CLUSTERING_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(CLUSTERING_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");

                table.string(FIELDS.CONDO_ID, 36).notNullable().index()
                    .references(CONDO_TABLE_SCHEMA.FIELDS.ID)
                    .inTable(CONDO_TABLE_SCHEMA.TABLE_NAME)
                    .onUpdate("CASCADE")
                    .onDelete("CASCADE");
            });
        });
};

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.each([
        clusteringType(knex, promise),
        clustering(knex, promise),
        clusteringMembers(knex, promise),
    ], () => true);
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.raw(`DROP TABLE IF EXISTS ${CLUSTERING_TYPE_TABLE_SCHEMA.TABLE_NAME} CASCADE`);
        });
};
