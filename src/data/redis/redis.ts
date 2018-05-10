import * as Bluebird from "bluebird";
import {ClientOpts, Multi, RedisClient} from "redis";
import * as _ from "lodash";
import {Configuration, Logger, Utils} from "../../libs";
const waitOn = require("wait-on");
const RedisLib = require("redis");
Bluebird.promisifyAll(RedisLib.Multi.prototype);
Bluebird.promisifyAll(RedisLib.RedisClient.prototype);

declare module "redis" {
    export interface Multi extends NodeJS.EventEmitter {
        constructor();
        execAsync(...args: any[]): Bluebird<any>;
    }
    export interface RedisClient extends NodeJS.EventEmitter {
        decrAsync(...args: any[]): Bluebird<any>;
        delAsync(...args: any[]): Bluebird<any>;
        execAsync(...args: any[]): Bluebird<any>;
        getAsync(...args: any[]): Bluebird<any>;
        incrAsync(...args: any[]): Bluebird<any>;
        expireAsync(...args: any[]): Bluebird<any>;
        keysAsync(...args: any[]): Bluebird<any>;
        saddAsync(...args: any[]): Bluebird<any>;
        scardAsync(...args: any[]): Bluebird<any>;
        sdiffAsync(...args: any[]): Bluebird<any>;
        sdiffstoreAsync(...args: any[]): Bluebird<any>;
        selectAsync(...args: any[]): Bluebird<any>;
        setAsync(...args: any[]): Bluebird<any>;
        sinterAsync(...args: any[]): Bluebird<any>;
        sismemberAsync(...args: any[]): Bluebird<any>;
        smembersAsync(...args: any[]): Bluebird<any>;
        smoveAsync(...args: any[]): Bluebird<any>;
        spopAsync(...args: any[]): Bluebird<any>;
        srandmemeberAsync(...args: any[]): Bluebird<any>;
        sremAsync(...args: any[]): Bluebird<any>;
        sscanAsync(...args: any[]): Bluebird<any>;
        sunionAsync(...args: any[]): Bluebird<any>;
        sunionstoreAsync(...args: any[]): Bluebird<any>;
    }
}

interface RedisOpts extends ClientOpts {
    prefix: string;
}


export class RedisConnection {
    private opts: RedisOpts;
    private client: RedisClient;
    public prefix: string;
    public db: string;

    constructor(opts?: any) {
        opts = opts || {};
        let defaultOpts: RedisOpts = {
            host: "localhost",
            port: 6379,
            db: "1",
            prefix: process.env.NODE_ENV + ":icondo:service:v1:",
        };

        this.opts = _.defaultsDeep(opts, defaultOpts) as RedisOpts;
        this.prefix = this.opts.prefix;
        this.db = this.opts.db;
    }

    public initWithWaiting(): Bluebird<boolean> {
        if (process.env.NODE_ENV === "test") {
            return Bluebird.resolve(true);
        }
        Logger.info("Wait for redis connection");

        let isComplete = false;
        return Utils.PromiseLoop(
            () => {
                return isComplete === true;
            },
            () => {
                return new Bluebird((resolve, reject) => {
                    waitOn({
                        resources: [`tcp:${this.opts.host}:${this.opts.port}`]
                    }, (err) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }).then(() => {
                    this.client = Bluebird.promisifyAll(RedisLib.createClient(this.opts)) as RedisClient;
                    Logger.info("Redis connection is OK");
                    isComplete = true;
                }).catch((err) => {
                    Logger.info("Connect to redis failed, try again");
                    Logger.error(err.message);
                    isComplete = false;
                });
            })
            .then((object) => {
                return isComplete;
            });
    }

    /**
     *
     * @returns {RedisClient}
     */
    public getClient(): RedisClient {
        return this.client;
    }

    /**
     * Create a unique key in redis
     * @param params array of string
     */
    private createKey(...params: string[]): string {
        return params.filter(val => val != null && val !== "").join(":");
    }

    /**
     *
     * @param params
     * @returns {string}
     */
    private createCacheKey(...params: string[]): string {
        return this.createKey("cache", ...params);
    }

    /**
     *
     * @param userId
     * @returns {string}
     */
    public sessionSetKey(userId: string): string {
        return this.createKey("sessions", userId);
    }

    /**
     *
     * @param whatOnId
     * @returns {string}
     */
    public getWhatOnCountKey(whatOnId: string) {
        return this.createKey("whatOn", "counter", whatOnId);
    }

    /**
     *
     * @param announcementId
     * @returns {string}
     */
    public getAnnouncementCountKey(announcementId: string) {
        return this.createKey("announcement", "counter", announcementId);
    }

    /**
     *
     * @param garageSaleId
     * @returns {string}
     */
    public getGarageSaleLikeKey(garageSaleId: string) {
        return this.createKey("garageSale", "like", garageSaleId);
    }

    /**
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedPostKey(type: string, feedId: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "post", feedId);
    }

    /**
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedLikeKey(type: string, feedId: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "like", feedId);
    }

    /**
     * The key save the user like the feed.
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedLikeByUserKey(type: string, feedId: string, userLike: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "like", feedId, "by", userLike);
    }

    /**
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedCommentKey(type: string, feedId: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "comment", feedId);
    }

    /**
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedCommentCounterKey(type: string, feedId: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "comment", "counter", feedId);
    }

    /**
     *
     * @param type
     * @param feedId
     * @returns {string}
     */
    public getFeedCommentLikeKey(type: string, feedId: string, commentId: string) {
        return this.createKey("feed", type.toString().toLowerCase(), "comment", feedId, "like", commentId);
    }

    /**
     *
     * @param level
     * @param id
     * @param slotId
     * @param week
     * @returns {string}
     */
    public getBookingRateLimiterKey(level: string, owner: string, kind: string, targetlLevel: string, target: string, bookingRestrictUnitId: string, value: string): string {
        return this.createKey("booking", "limiter", level, owner, kind, targetlLevel, target, value);
    }

    /**
     *
     * @param userId
     * @param slotId
     * @returns {string}
     */
    public getCacheBookingRatemiterSetKey(userId: string, facilityId: string, stamp: string): string {
        return this.createCacheKey("booking", "limiter", userId, facilityId, stamp.toString());
    }

    public getUserTokenKey(userId: string, token: string): string {
        return this.createKey("users", userId, "tokens", token);
    }

    public getUserRoleSetKey(userId: string): string {
        return this.createKey("users", userId, "roles");
    }

    public getUserCondoKey(userId: string): string {
        return this.createKey("users", userId, "condoId");
    }

    public getClusteringSetKey(clusterId: string): string {
        return this.createKey("cluster", clusterId);
    }

    public getCondoClusterSetKey(condoId: string, type: string): string {
        return this.createKey("condo", condoId, "cluster", type);
    }

    public getPinKey(phoneNumber: string): string {
        return this.createKey("phoneNumber", phoneNumber);
    }

    public getAdminTokenKey(token: string): string {
        return this.createKey("adminToken", token);
    }

    public getLatestTransactionKey(condoId: string): string {
        return this.createKey("latestTransaction", condoId);
    }

    public getCounterDepositKey(condoId: string): string {
        return this.createKey("counterDeposit", condoId);
    }

    public getFeedbackReadersKey(feedbackId: string): string {
        return this.createKey("feedbackReaders", feedbackId);
    }
}

export const Redis = new RedisConnection(Configuration.database != null ? Configuration.database.redis : null);
export default Redis;
