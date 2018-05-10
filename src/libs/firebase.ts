import * as sdk from "firebase-admin";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs";
import { Logger } from "./index";

interface FirebaseOpts {
    file: string;
    database: string;
}

export class FirebaseAdmin {
    private opts: FirebaseOpts;
    private instance: sdk.app.App;
    constructor(opts: any) {
        opts = opts || {};

        let defaultConf: FirebaseOpts = {
            file: "firebase.json",
            database: "https://icondo-demo.firebaseio.com",
        };

        this.opts = _.defaultsDeep(opts, defaultConf) as FirebaseOpts;
        let url = path.join(__dirname, "..", "configs", this.opts.file);
        if (fs.existsSync(url)) {
            this.instance = sdk.initializeApp({
                credential: sdk.credential.cert(require(url)),
                databaseURL: this.opts.database,
            });
        } else {
            Logger.warn(`Firebase config file - ${this.opts.file} does not exist, skip`);
            this.instance = null;
        }
    }

    public getInstance(): sdk.app.App {
        return this.instance;
    }
}

export default FirebaseAdmin;
