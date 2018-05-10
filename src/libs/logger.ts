/**
 * Created by kiettv on 12/16/16.
 */
import * as Promise from "bluebird";
import "le_node";
import * as mkdir from "mkdirp";
import * as path from "path";
import * as trace from "stack-trace";
import * as winston from "winston";

export interface Log {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}

export class Logger {
    private httpLogger: winston.LoggerInstance;
    private processLogger: winston.LoggerInstance;
    private logFolder: string;

    constructor(opts?: any) {
        this.logFolder = ".";
        opts = opts || {};
        this.init(opts);
    }

    public getTransportLogger(): winston.LoggerInstance {
        return this.httpLogger;
    }

    public error(message: string, meta?: any): void {
        if (meta != null) {
            if (meta instanceof Error && meta.stack != null) {
                this.processLogger.error(message, {stack: trace.parse(meta)});
            } else {
                this.processLogger.error(message, meta);
            }
        } else {
            this.processLogger.error(message);
        }
    }

    public warn(message: string, meta?: any): void {
        if (meta != null) {
            this.processLogger.warn(message, meta);
        } else {
            this.processLogger.warn(message);
        }
    }

    public info(message: string, meta?: any): void {
        if (meta != null) {
            this.processLogger.info(message, meta);
        } else {
            this.processLogger.info(message);
        }
    }

    public debug(message: string, meta?: any): void {
        if (meta != null) {
            this.processLogger.debug(message, meta);
        } else {
            this.processLogger.debug(message);
        }
    }

    private createFolder(pathToFolder: string): Promise<boolean> {
        if (pathToFolder == null) {
            return Promise.resolve(false);
        }

        return new Promise<boolean>((resolve, reject) => {
            mkdir(pathToFolder, err => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    private init(opts: any): void {
        this.logFolder = path.join(__dirname, "..", "logs");
        this.createFolder(this.logFolder)
            .then(result => {
                if (result) {
                    this.info("Creating logs folder successful");
                } else {
                    this.warn("Creating logs folder failed");
                }
            })
            .catch(err => {
                this.error(err.message, err);
            });

        let console = new winston.transports.Console({
            level: "debug",
            handleExceptions: true,
            timestamp: true,
            json: false,
            colorize: true,
            useConsole: true,
        });

        let processTransports: winston.TransportInstance[] = [];
        if (opts.console != null && process.env.NODE_ENV !== "test") {
            let consoleTrans = new winston.transports.Console(opts.console);
            processTransports.push(consoleTrans);
        }
        if (opts.file != null && opts.file.process != null && process.env.NODE_ENV !== "test") {
            let conf: any = opts.file.process;
            conf.filename = `${this.logFolder}${path.sep}${opts.file.process.name}`;
            let fileTrans = new winston.transports.File(conf);
            processTransports.push(fileTrans);
        }
        this.processLogger = new winston.Logger({
            transports: processTransports,
            exitOnError: opts.exitOnError != null ? opts.exitOnError : false,
        });
        if (opts.logentries != null && opts.logentries.transportToken != null && opts.logentries.transportToken !== "" && process.env.NODE_ENV !== "testing") {
            this.processLogger.add(winston.transports["Logentries"], {
                token: opts.logentries.processToken,
                json: true,
            });
        }

        let httpTransports: winston.TransportInstance[] = [];
        if (opts.console != null && process.env.NODE_ENV !== "test") {
            httpTransports.push(console);
        }
        if (opts.file != null && opts.file.transport != null && process.env.NODE_ENV !== "test") {
            let conf: any = opts.file.transport;
            conf.filename = `${this.logFolder}${path.sep}${opts.file.transport.name}`;
            let fileHttpTrans = new winston.transports.File(conf);
            httpTransports.push(fileHttpTrans);
        }
        this.httpLogger = new winston.Logger({
            transports: httpTransports,
            exitOnError: false,
        });
        if (opts.logentries != null && opts.logentries.transportToken != null && opts.logentries.transportToken !== "" && process.env.NODE_ENV !== "test") {
            this.httpLogger.add(winston.transports["Logentries"], {
                token: opts.logentries.transportToken,
                json: true,
            });
        }
    }

}
export default Logger;
