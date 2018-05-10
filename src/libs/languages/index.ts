/**
 * Created by kiettv on 12/17/16.
 */
import * as path from "path";
import * as glob from "glob";
import {EN as Message} from "./en";

export class I18N {
    private opts: any;
    private map: any;

    constructor(opts?: any) {
        this.opts = opts != null ? {...opts} : {};
        let acceptableLanguages = glob.sync(`${__dirname}/*.js`)
            .map((file) => path.basename(file, ".js"))
            .filter((language) => language !== "index" && language !== "language");

        this.map = acceptableLanguages.reduce((acc, language) => {
            acc[language] = require(`./${language}`).default;
            return acc;
        }, {} as {[language: string]: Message});
    }

    public messageOf(language: string): Message {
        return this.map[language];
    }
}

export * from "./language";
export default I18N;
