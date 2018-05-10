/**
 * Created by kiettv on 12/26/16.
 */
import { Configuration, Logger, Utils } from "../../libs";
import * as Bookshelf from "bookshelf";
import * as Knex from "knex";
import * as Bluebird from "bluebird";
const waitOn = require("wait-on");

export class Connection {
    private sql: any;
    private instance: Bookshelf;

    constructor(opts?: any) {
        opts = opts || {};
        let defaultConf: any = {
            host: "127.0.0.1",
            port: 5432,
            user: "root",
            password: "",
            database: "test",
            charset: "utf8mb4",
            timezone: "UTC",
        };
        let database: any = Configuration.database || { postgres: defaultConf };
        this.sql = database.postgres != null ? database.postgres : defaultConf;
        if (process.env.DB_HOST != null) {
            this.sql.host = process.env.DB_HOST;
        }
        if (process.env.DB_PORT != null) {
            this.sql.port = process.env.DB_PORT;
        }
        if (process.env.DB_USER != null) {
            this.sql.user = process.env.DB_USER;
        }
        if (process.env.DB_PASSWORD != null) {
            this.sql.password = process.env.DB_PASSWORD;
        }
        if (process.env.DB_NAME != null) {
            this.sql.database = process.env.DB_NAME;
        }

        let knex: Knex = Knex({
            client: "postgresql",
            connection: this.sql,
            debug: this.sql.debug ? this.sql.debug : false,
        });

        this.instance = Bookshelf(knex);
    }

    public migration(): Bluebird<boolean> {
        Logger.info("Wait for database connection");

        let isComplete = false;
        return Utils.PromiseLoop(
            () => {
                return isComplete === true;
            },
            () => {
                return new Bluebird((resolve, reject) => {
                    waitOn({
                        resources: [`tcp:${this.sql.host}:${this.sql.port}`]
                    }, (err) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }).then(() => {
                    return Bluebird.delay(1000);
                }).then(() => {
                    Logger.info("Perform database migration");
                    return this.instance.knex.migrate.latest({
                        directory: __dirname + "/migrations",
                    });
                }).then((info) => {
                    Logger.info("All migrations were success");
                    isComplete = true;
                }).catch((err) => {
                    Logger.info("All migrations were failed, try again");
                    Logger.error(err.message);
                    isComplete = false;
                });
            })
            .then((object) => {
                return isComplete;
            });
    }

    public bookshelf(): Bookshelf {
        // this.instance.plugin("")
        return this.instance;
    }
}

export const Database = new Connection(Configuration.database);
export const Dto = Database.bookshelf();
export default Connection;
