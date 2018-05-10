/**
 * Created by kiettv on 12/26/16.
 */
import * as _ from "lodash";
import * as moment from "moment";
import * as momentTz from "moment-timezone";
import { Json, JsonConverter, Bookshelf, BookshelfConverter } from "../libs/mapper";
class JsonDateConverter implements JsonConverter<momentTz.Moment> {
    public fromJson(data: any): momentTz.Moment {
        let date: momentTz.Moment;
        if (_.isDate(data)) {
            date = momentTz.tz(data, "UTC");
        }
        else {
            date = momentTz.tz(new Date(data), "UTC");
        }
        return date;
    }

    public toJson(data: momentTz.Moment): any {
        if (data != null && data.isValid()) {
            return data.toDate();
        }
    }
}

export const JsonDate = new JsonDateConverter();

class DateConverter implements BookshelfConverter<momentTz.Moment> {
    public fromBookshelf(data: any): momentTz.Moment {
        let date: momentTz.Moment;
        if (_.isDate(data)) {
            date = momentTz.tz(data, "UTC");
        }
        else {
            date = momentTz.tz(new Date(data), "UTC");
        }
        return date;
    }
    public toBookshelf(data: momentTz.Moment): any {
        if (data != null && data.isValid()) {
            return data.toDate();
        }
    }
}

export const BookshelfDate = new DateConverter();

export class BaseModel {

    @Json("id")
    @Bookshelf("id")
    public id: string = undefined;

    @Json({ name: "createdDate", converter: JsonDate })
    @Bookshelf({ name: "updated_date", converter: BookshelfDate })
    public createdDate: momentTz.Moment = undefined;

    @Json({ name: "updatedDate", converter: JsonDate })
    @Bookshelf({ name: "updated_date", converter: BookshelfDate })
    public updatedDate: momentTz.Moment = undefined;

    @Bookshelf({ name: "is_deleted" })
    public isDeleted: boolean = undefined;

    @Json("isEnable")
    @Bookshelf({ name: "is_enable" })
    public isEnable: boolean = undefined;

    public static hasValue(val: any): boolean {
        return !_.isNull(val) && !_.isEmpty(val);
    }

    /**
     * Convert model to JSON
     * @param val
     * @return {string}
     */
    public static toJSON(val: any): string {
        return JSON.stringify(val);
    }

    /**
     * Convert model from JSON
     * @param val
     * @param defaultVal
     * @return {T}
     */
    public static fromJSON<T>(val: string, defaultVal: T = undefined): T {
        try {
            let ret = JSON.parse(val);
            return ret as T;
        }
        catch (err) {
            return defaultVal;
        }
    }

    /**
     * Parse time inverval as Moment object
     * @param val
     * @param defaultVal
     * @return {momentTz.Moment}
     */
    public static getTimeInterval(val: any, defaultVal: Date = undefined): momentTz.Moment {
        let date: momentTz.Moment;
        if (defaultVal != null) {
            date = moment(defaultVal, "HH:mm:ss");
        }
        if (_.isString(val)) {
            date = moment(val, "HH:mm:ss");
        } else if (_.isDate(val)) {
            date = moment(val, "HH:mm:ss");
        }
        return date;
    }

    /**
     * Parse date as Moment object
     * @param val
     * @param defaultVal
     * @return {momentTz.Moment}
     */
    public static getDate(val: any, defaultVal: Date = undefined): momentTz.Moment {
        let date: momentTz.Moment;
        if (defaultVal != null) {
            date = momentTz.tz(defaultVal, "UTC");
        }
        if (_.isDate(val)) {
            date = momentTz.tz(val, "UTC");
        }
        else if (val != null) {
            date = momentTz.tz(new Date(val), "UTC");
        } else {
            date = val;
        }
        return date;
    }

    public static getString(val: any, defaultVal?: string): string {
        return (val != null && _.isString(val) && val !== "") ? val : defaultVal != null ? defaultVal : undefined;
    }

    public static getArrayString(val: string[], defaultVal?: string[]): string[] {
        return (val != null && _.isArray(val)) ? val : defaultVal != null ? defaultVal : undefined;
    }

    public static getBoolean(val: any, defaultVal?: boolean): boolean {
        if (val != null) {
            if (typeof (val) === "string") {
                val = val.toLowerCase();
            }
            switch (val) {
                case true:
                case 1:
                case "yes":
                case "right":
                case "true":
                case "1":
                    return true;
                default:
                    return false;
            }
        }
        return defaultVal;
    }

    public static getNumber(val: any, defaultVal: number = 0): number {
        if (val != null) {
            let num = Number(val);
            return isNaN(val) ? defaultVal : num;
        }
        return defaultVal;
    }

    public static filter(val: any, filters: string[] = []): void {
        if (val != null) {
            filters.forEach(field => {
                if (val.hasOwnProperty(field)) {
                    val[field] = undefined;
                }
            });
        }
    }


}

export default BaseModel;
