import * as Bluebird from "bluebird";
import * as Knex from "knex";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`INSERT INTO slot_time_types (id, description) VALUES ('total', 'Total');`);
    })
    .then(() => {
        return knex.raw(`INSERT INTO slot_frequency_restriction (id, is_deleted, is_enable, created_date, updated_date, name, type, condition_interval, description)
                        VALUES ('OneDay', false, true, now(), now(), 'No of times a day', 'Day', 0, 'Restrict the number of times a day. [Current Day]');`);
    })
    .then(() => {
        return knex.raw(`UPDATE slot_restrictions SET slot_time_type_id = 'total' where slot_time_type_id = 'normal_hours';`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};