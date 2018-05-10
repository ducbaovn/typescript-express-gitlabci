/**
 * Created by kiettv on 12/16/16.
 */
import * as compression from "compression";
import * as express from "express";
import * as helmet from "helmet";
import * as http from "http";
import * as Bluebird from "bluebird";
import Router from "./routes";
import { ExceptionModel } from "./models";
import { Logger, ErrorCode, HttpStatus, Scheduler } from "./libs";
import { BaseDto } from "./data/sql/models";
import { Database } from "./data/sql/connection";
import { Redis } from "./data/redis/redis";
import { cors, httpError, httpLogger, notFound, recover, checkVersion } from "./middlewares";
import { json, urlencoded } from "body-parser";
import { WorkerService, FeedbackService, OnlineFormService, BookingService, UserUnitService } from "./interactors";

export class Application {
    private opts: any;
    private app: express.Express;
    private bind: number;
    private server: http.Server;

    constructor(opts?: any) {
        this.opts = opts !== null ? { ...opts } : {};
        this.app = express();
        this.app.locals.title = "iCondo";
        this.app.enable("case sensitive routing");
        this.app.enable("trust proxy");
        this.app.disable("x-powered-by");
        this.app.disable("etag");

        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(cors());
        this.app.use(httpLogger(Logger.getTransportLogger()));
        this.app.use(checkVersion());
        this.app.use("/", Router);
        this.app.use(notFound());
        this.app.use(httpError(Logger));
        this.app.use(recover((error: any, res: express.Response): void => {

            let err: ExceptionModel;
            if (error.httpStatus != null) {
                err = error as ExceptionModel;
            } else if (error instanceof BaseDto.NotFoundError || BaseDto.NoRowsDeletedError || BaseDto.NoRowsUpdatedError) {
                // DB error: BaseDto.NotFoundError, BaseDto.NoRowsDeletedError, BaseDto.NoRowsUpdatedError
                err = new ExceptionModel(
                    ErrorCode.RESOURCE.NOT_FOUND.CODE,
                    ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                    false,
                    HttpStatus.NOT_FOUND,
                );
            } else {
                err = ExceptionModel.fromError(ErrorCode.UNKNOWN.GENERIC.CODE, err, true);
            }

            res.status(err.httpStatus);
            err.name = undefined;
            err.httpStatus = undefined;
            res.json(err);
        }));
        process.on("unhandledRejection", (reason: any): void => {
            Logger.error("unhandledRejection: " + reason);
        });
        process.on("uncaughtException", (err: Error): void => {
            Logger.error(err.message, err);
            // Note: When this happen, the process should be terminated
            // process.exit(1);
        });
    }

    public listen(port: number) {
        Logger.info("Wait for others components become available");
        Bluebird.all([
            Database.migration(),
            Redis.initWithWaiting(),
            Scheduler.initWithWaiting(),
        ]).then(() => {
            return Bluebird.all([
                WorkerService.scheduleTenancyExpiry(),
                FeedbackService.resetCounterFeedbackPendingFirebase(),
                OnlineFormService.resetCounter(),
                BookingService.resetCounterDeposit(),
                UserUnitService.resetCounter()
            ]);
        })
        .then(() => {
            if (process.env.PORT != null) {
                this.bind = Application.normalizePort(process.env.PORT);
            } else if (port != null) {
                this.bind = Application.normalizePort(port);
            } else {
                this.bind = 3000;
            }
            this.app.set("port", this.bind);
            this.server = http.createServer(this.app);
            this.server.on("error", this.onError.bind(this));
            this.server.on("listening", this.onListening.bind(this));
            this.server.listen(this.bind);
        }).catch(err => {
            Logger.error(err.message, err);
        });
    }

    public getExpressInstance(): express.Express {
        return this.app;
    }

    private onListening() {
        let addr = this.server.address();
        let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
        Logger.info("Listening on " + bind);
    }

    private onError(error: any) {
        if (error.syscall !== "listen") {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                Logger.error(this.bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                Logger.error(this.bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private static normalizePort(val: any) {
        let port = parseInt(val, 10);
        if (isNaN(port)) {
            return val;
        }
        if (port >= 0) {
            return port;
        }
        return false;
    }
}

export default Application;
