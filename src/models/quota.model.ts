import { BaseModel } from "./base.model";
import * as momentTz from "moment-timezone";
import { DateTime } from "aws-sdk/clients/ssm";

export class QuotaModel extends BaseModel {
    public type: string;
    public level: string;
    public unit: string;
    public isNoLimit: boolean;
    public max: number;
    public current: number;
    public remain: number;
    public startTime: DateTime;
    public endTime: DateTime;
    public isExempt: boolean;

    public static summaryQuotas(type: string, quotas: QuotaModel[]): QuotaModel {
        let result = new QuotaModel();
        result.isNoLimit = true;
        result.type = type;
        for (let quota of quotas) {
            if (quota.type === type && !quota.isNoLimit) {
                result.isNoLimit = false;
                // get minimum of remain and resetTime
                if (result.remain == null || quota.remain < result.remain) {
                    result.remain = quota.remain;
                    result.startTime = quota.startTime;
                    result.endTime = quota.endTime;
                } else if (quota.remain === result.remain) {
                    result.startTime = result.startTime < quota.startTime ? result.startTime : quota.startTime;
                    result.endTime = result.endTime > quota.endTime ? result.endTime : quota.endTime;
                }
            }
        }
        return result;
    }
}

export default QuotaModel;
