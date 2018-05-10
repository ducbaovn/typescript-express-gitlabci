import * as Bluebird from "bluebird";
import * as Knex from "knex";
import * as Schema from "../schema";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, table => {
                table.string(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TICKET_NUMBER, 30).unique();
            });
        })
        .then(() => {
            return knex.raw(`SELECT DISTINCT(condo_id) FROM feedback;`)
                .then(result => {
                    return Bluebird.each(result.rows, (condo => {
                        let mcst: string;
                        let condoId = condo["condo_id"];
                        return knex.raw(`SELECT mcst_number FROM condo WHERE id = '${condoId}';`)
                            .then(condos => {
                                if (condos != null && condos.rows.length > 0) {
                                    mcst = condos.rows[0]["mcst_number"];
                                    return knex.raw(`SELECT DISTINCT(date_part('year', created_date at time zone 'Asia/Singapore')) AS year FROM feedback WHERE condo_id = '${condoId}';`)
                                        .then(years => {
                                            return Bluebird.each(years.rows, (row => {
                                                let year = row["year"];
                                                let orderNumber = (year % 100) * 100000;
                                                return knex.raw(`SELECT id, date_part('year', created_date at time zone 'Asia/Singapore') AS year FROM feedback
                                            WHERE condo_id = '${condoId}' AND date_part('year', created_date at time zone 'Asia/Singapore') = ${year} ORDER BY created_date;`)
                                                    .then(feedbacks => {
                                                        let ticketNumber: string;
                                                        return Bluebird.each(feedbacks.rows, (feedback => {
                                                            orderNumber++;
                                                            ticketNumber = "" + mcst + orderNumber;
                                                            return knex.raw(`UPDATE feedback SET ticket_number = '${ticketNumber}' WHERE id = '${feedback["id"]}'`);
                                                        }));
                                                    });
                                            }));
                                        });
                                }
                            });
                    }));
                });
        });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
        .then(() => {
            return knex.schema.table(Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME, (table => {
                table.dropColumn(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TICKET_NUMBER);
            }));
        });
};