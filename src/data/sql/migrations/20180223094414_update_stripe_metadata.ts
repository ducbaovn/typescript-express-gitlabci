import * as Bluebird from "bluebird";
import * as Knex from "knex";
import { CondoService, PaymentGatewayManager, PaymentSourceService } from "../../../interactors";

export const up = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve()
    .then(() => {
        return CondoService.list(["paymentGatewayAccount"]);
    })
    .then(condos => {
        Bluebird.each(condos.data, (condo => {
            if (!condo.payByCash && condo.privateKey) {
                return PaymentGatewayManager.updateAllCustomerMetadata(condo.id)
                .then(() => {
                    return PaymentGatewayManager.updateAllChargeMetadata(condo.id);
                });
            }
            return Bluebird.resolve();
        }));
        return Bluebird.resolve();
    });
};

export const down = (knex: Knex, promise: typeof Bluebird): Bluebird<any> => {
    return promise.resolve();
};