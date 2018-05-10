/**
 * Created by ducbaovn on 04/07/17.
 */


import * as express from "express";
import * as Promise from "bluebird";
import {ErrorCode, HttpStatus} from "../../../../libs";
import {ExceptionModel, SessionModel, StateModel} from "../../../../models";
import {PROPERTIES, ROLE, MESSAGE_INFO} from "../../../../libs/constants";
import {BaseDto} from "../../../../data/sql/models";
import * as Schema from "../../../../data/sql/schema";
import Redis from "../../../../data/redis/redis";

export class HealthHandler {
    public static check(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let checkDatabase = () => {
            return BaseDto.knex().raw("SELECT * FROM health").then(result => {
                return result.rows;
            });
        };
        let checkRedis = () => {
            return Redis.getClient().setAsync("health", 1);
        };
        return Promise.all([checkDatabase(), checkRedis()])
        .then(result => {
            res.status(HttpStatus.OK);
            res.send("OK");
        })
        .catch(err => {
            next(err);
        });
    }
}

export default HealthHandler;

