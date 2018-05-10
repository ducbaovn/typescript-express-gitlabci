import { SessionRepository, UserRepository } from "../data";
import { BaseRepository } from "../data/base.repository";
import { BaseDto, SessionDto, UserDto } from "../data/sql/models";
import { SESSION_TABLE_SCHEMA, } from "../data/sql/schema";
import { Logger, Utils } from "../libs";
import { BaseModel, SessionModel, UserModel } from "../models";
import * as Bluebird from "bluebird";
import { Redis } from "../data/redis/redis";
import { QueryBuilder } from "knex";
import { Moment } from "moment-timezone";

export class ToolService {
    constructor() {
    }

    public restoreRedis(date: Moment): Bluebird<boolean> {
        return Bluebird.all([
            this.restoreSession(date),
            this.restoreUserInfo(date),
        ]).then(() => {
            return true;
        });
    }
    private restore<M extends BaseModel, D extends BaseDto<D>>(date: Moment, repo: BaseRepository<D, M>, handler: (model: M) => Bluebird<any>, related: string[] = [], query?: (q: QueryBuilder) => void) {
        let offset: number = 0;
        let limit: number = 1000;
        let isComplete: boolean = false;
        let client = Redis.getClient();
        let current = new Date();

        return Utils.PromiseLoop(
            // Stop condition
            () => {
                return isComplete === true;
            },
            // logic
            () => {
                return Bluebird.resolve()
                    .then(() => {
                        return repo.findByQuery((q: QueryBuilder) => {
                            query(q);
                            if (date != null) {
                                q.where(SESSION_TABLE_SCHEMA.FIELDS.UPDATED_DATE, ">", date.toDate());
                            }
                            q.limit(limit);
                            q.offset(offset);
                            q.orderBy(SESSION_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "ASC");
                        }, related);
                    })
                    .then((object) => {
                        if (object.length < limit) {
                            isComplete = true;
                        }
                        return object;
                    })
                    .each(handler)
                    .then((object) => {
                        offset += limit;
                        return true;
                    });
            });
    }

    private restoreUserInfo(date: Moment): Bluebird<boolean> {
        return this.restore<UserModel, UserDto>(
            date,
            UserRepository,
            (model: UserModel): Bluebird<any> => {
                let multi = Redis.getClient().multi();

                if (model.roleId != null) {
                    let roleKey = Redis.getUserRoleSetKey(model.id);
                    multi.sadd(roleKey, model.roleId);
                }

                if (model.condo != null) {
                    let condoKey = Redis.getUserCondoKey(model.id);
                    multi.set(condoKey, model.condo.id);
                }

                return multi.execAsync();
            },
            ["role", "unit", "condo"],
            (q: QueryBuilder): void => {
            },
        ).then((object) => {
            Logger.info("Restore user's info to Redis completed");
            return true;
        }).catch((err: Error) => {
            Logger.error("Restore user's info to Redis failed", err);
            return false;
        });
    }
    private restoreSession(date: Moment): Bluebird<boolean> {
        let current = new Date();
        return this.restore<SessionModel, SessionDto>(
            date,
            SessionRepository,
            (model: SessionModel): Bluebird<any> => {
                let key = Redis.getUserTokenKey(model.userId, model.token);
                let multi = Redis.getClient().multi();

                multi.set(key, 1);
                if (model.expire != null) {
                    multi.expire(key, (model.expire.milliseconds() / 1000));
                }

                return multi.execAsync();
            },
            [],
            (q: QueryBuilder): void => {
                q.where(SESSION_TABLE_SCHEMA.FIELDS.EXPIRE, ">", current);
            },
        ).then((object) => {
            Logger.info("Restore session to Redis completed");
            return true;
        }).catch((err: Error) => {
            Logger.error("Restore session to Redis failed", err);
            return false;
        });
    }
}

export default ToolService;
