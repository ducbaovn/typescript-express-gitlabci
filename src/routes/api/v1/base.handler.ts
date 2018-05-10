/**
 * Created by kiettv on 1/3/17.
 */
import * as _ from "lodash";
export class BaseHandler {
    public static clean(model: any): any {
        let prune = (current) => {
            _.forOwn(current, (value, key) => {
                if (_.isNull(value) ||
                    _.isNaN(value) ||
                    (_.isString(value) && _.isEmpty(value)) ||
                    value === "null" ||
                    (_.isObject(value) && _.isEmpty(prune(value)))) {
                    current[key] = undefined;
                }
            });
            // remove any leftover undefined values from the delete
            // operation on an array
            if (_.isArray(current)) {
                _.pull(current, undefined);
            }
            return current;

        };

        return prune(_.cloneDeep(model));
    }
}

export default BaseHandler;
