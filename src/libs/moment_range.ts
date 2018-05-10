import * as moment from "moment";
import { extendMoment, Range } from "moment-range";


declare module "moment" {
    function extendMoment(moment: any): any;

    interface Moment {
        (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): moment.Moment;
        (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment;

        range(start: Date, end: Date): Range;
        range(start: Moment, end: Moment): Range;
        range(range: Date[]): Range;
        range(range: Moment[]): Range;
        range(range: string): Range;
    }

    interface Range {
        by(range: string, hollaback?: (current: Moment) => void, exclusive?: boolean): Date[];
        by(range: Range, hollaback?: (current: Moment) => void, exclusive?: boolean): Date[];
    }
}

export const MomentRange: moment.Moment = extendMoment(moment);
export default MomentRange;
