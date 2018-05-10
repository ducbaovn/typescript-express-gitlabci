/**
 * Created by nguyenpv on 10/25/17.
 */

import * as Promise from "bluebird";
import {ErrorCode, HttpStatus, Scheduler, Logger} from "../libs";
import {
    NOTIFY_TENANT_EXPIRE, SCHEDULER_SCRIPT, SCHEDULER_EVERY
} from "../libs/constants";
import * as UUID from "uuid";
import {UserUnitService} from "./";
import {Redis} from "../data/redis/redis";

export class WorkderService {
    constructor() {

    }

    public scheduleRepeat(job: any, cron: string) {
        // only allow unique job to schedule repeat because we need unique key to remove scheduler
        if (job && job.data && job.data.unique && cron) {
            return Promise.resolve()
            .then(() => {
                // remove old unique job scheduler
                let prefixRedis = Redis.prefix;
                let prefixScheduler = Scheduler.prefix;
                let rawExpiryKey = Scheduler.getExpiryKey(job.data.unique);
                let rawDataKey = Scheduler.getDataKey(job.data.unique);
                let patt = prefixRedis.length < prefixScheduler.length ? new RegExp("^" + prefixRedis) : new RegExp("^" + prefixScheduler);
                let expiryKey = rawExpiryKey.replace(patt, "");
                let dataKey = rawDataKey.replace(patt, "");

                let multi = Redis.getClient().multi();
                // select scheduler db
                multi.select(Scheduler.db);
                // del expiry key and data key in scheduler db
                multi.del(expiryKey);
                multi.del(dataKey);
                // revert to redis db again
                multi.select(Redis.db);
                return multi.execAsync();
            })
            .then((result) => {
                console.log("Delete Scheduler Repeat Key:", result);
                // create new unique job scheduler
                return Scheduler.scheduleRepeat(job, cron);
            });
        }
        return Promise.resolve();
    }

    public scheduleTenancyExpiry() {
        Logger.info("Scheduler Repeat Tenancy Expiry: 0 0 16 * * *");
        let job = Scheduler.createUniqueJob(SCHEDULER_SCRIPT.TRIGGER_NAME, {
            path: NOTIFY_TENANT_EXPIRE.TENANT_EXPIRE_PATH,
        }, SCHEDULER_EVERY.TENANCY_EXPIRY_REMINDER);

        return this.scheduleRepeat(job, "0 0 16 * * *");
    }

    public tenancyExpiry() {
        return UserUnitService.tenancyExpirySchedule();
    }
}

export default WorkderService;
