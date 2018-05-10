import * as Bluebird from "bluebird";
import * as Knex from "knex";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return knex.raw(`INSERT INTO slot_frequency_restriction (id, is_deleted, is_enable, created_date, updated_date, name, type, condition_interval, description)
                        VALUES ('OneYear', false, true, now(), now(), 'No of times a year', 'Year', 0, 'Restrict the number of times a year. [Current Year]');`);
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};