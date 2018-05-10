const waitOn = require("wait-on");
import * as Promise from "bluebird";
import * as _ from "lodash";
import * as kue from "kue-scheduler";
import {ClientOpts} from "redis";
import {Queue, Job} from "kue";
import {Utils} from "./utils";
import {Redis} from "../data/redis/redis";
import {
    NOTIFY_TENANT_EXPIRE, SCHEDULER_SCRIPT, SCHEDULER_EVERY
} from "../libs/constants";

declare module "kue" {
    export interface Job extends NodeJS.EventEmitter {
        unique(unique: string): Job;
    }
    export interface Queue extends NodeJS.EventEmitter {
        enableExpiryNotifications(): void;
        clear(listener: Function): void;
        every(time: string, job: Job): void;
        schedule(time: string | Date, job: Job): void;
        now(job: Job): void;
        remove(job: string | Job | Object, listener: Function): void;
        restore(listener: Function);
        process(type: string, context: WorkerContext, listener: Function): void;
    }
    export interface WorkerContext extends NodeJS.EventEmitter {
        resume(): boolean;
        pause(timeout: number, fn: Function): void;
        shutdown(timeout: number, fn: Function): void;
    }
}

export const PRIORITY = {
    LOW: "low",
    NORMAL: "normal",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
};

interface Log {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}

interface ExecutorOptions {
    debug: boolean;
    prefix: string;
    skipConfig: boolean;
    restore: boolean;
    worker?: boolean;
    redis: ClientOpts;
}

export class Scheduler {
    private queue: Queue;
    private logger: Log;
    private opts: ExecutorOptions;
    public prefix: string;
    public db: string;

    constructor(opts: any, logger?: Log) {
        opts = opts || {};
        let defaultOpts: ExecutorOptions = {
            debug: false,
            prefix: "dev",
            skipConfig: false,
            redis: {
                port: 6379,
                host: "127.0.0.1",
                db: "0",
            },
            restore: true,
        };

        this.logger = logger || {
                error: (message: string, meta?: any): void => console.error(message),
                warn: (message: string, meta?: any): void => console.warn(message),
                info: (message: string, meta?: any): void => console.info(message),
                debug: (message: string, meta?: any): void => console.debug(message),
            };

        this.opts = _.defaultsDeep(opts, defaultOpts) as ExecutorOptions;
        this.opts.worker = false;
        this.prefix = this.opts.prefix;
        this.db = this.opts.redis.db;
    }

    public initWithWaiting(): Promise<boolean> {
        this.logger.info("Wait for worker's master");
        if (process.env.NODE_ENV === "test") {
            return Promise.resolve(true);
        }
        let isComplete = false;
        return Utils.PromiseLoop(
            () => {
                return isComplete === true;
            },
            () => {
                return new Promise((resolve, reject) => {
                    waitOn({
                        resources: [`tcp:${this.opts.redis.host}:${this.opts.redis.port}`]
                    }, (err) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }).then(() => {
                    return Promise.delay(1000);
                }).then(() => {
                    this.queue = kue.createQueue(this.opts);
                    this.queue.watchStuckJobs(1000);
                    isComplete = true;
                    this.logger.info("Worker's master is OK");
                }).catch((err) => {
                    this.logger.info("Connect to Worker's master failed, try again");
                    this.logger.error(err.message);
                    isComplete = false;
                });
            })
            .then((object) => {
                return isComplete;
            });
    }

    public createJob(script: string, payload: any, priority: string = PRIORITY.NORMAL): Job {
        if (this.queue == null) {
            return null;
        }
        return this.queue.createJob(script, payload)
            .attempts(3)
            .backoff({
                delay: 5000,
                type: "fixed",
            })
            .priority(priority);
    }

    public createUniqueJob(script: string, payload: any, uniqueKey: string, priority: string = PRIORITY.NORMAL): Job {
        if (this.queue == null) {
            return null;
        }
        return this.queue.createJob(script, payload)
            .attempts(3)
            .backoff({
                delay: 5000,
                type: "fixed",
            })
            .priority(priority)
            .unique(uniqueKey);
    }

    public scheduleOneShot(job: Job, triggerTime: Date): void {
        if (job != null && triggerTime != null && this.queue != null) {
            this.queue.schedule(triggerTime, job);
        }
    }

    public scheduleRepeat(job: Job, cron: string) {
        // only allow unique job to schedule repeat because we need unique key to remove scheduler
        return Promise.resolve()
        .then(() => {
            if (job && cron && this.queue) {
                return this.queue.every(cron, job);
            }
        });
    }

    public getExpiryKey(uniqueKey: string): string {
        return this.opts.prefix + ":scheduler:" + uniqueKey;
    }

    public getDataKey(uniqueKey: string): string {
        return this.opts.prefix + ":scheduler:data:" + uniqueKey;
    }

    public immediatelyJob(job: Job) {
        if (job != null) {
            this.queue.now(job);
        }
    }

    public isDebug(): boolean {
        return this.opts.debug;
    }
}

export default Scheduler;
