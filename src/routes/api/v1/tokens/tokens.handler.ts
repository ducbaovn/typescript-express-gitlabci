import * as express from "express";
import * as Promise from "bluebird";
import {Jwt, Mailer, Utils} from "../../../../libs";
import {UserModel} from "../../../../models";
import {PASSWORD_LENGTH, MESSAGE_INFO, EMAIL_TEMPLATE} from "../../../../libs/constants";
import {UserService} from "../../../../interactors";

export class TokensHandler {
    public static resetPassword(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let email = {
            template: EMAIL_TEMPLATE.SEND_CUSTOM_EMAIL,
            data: {
                firstName: "",
                content: MESSAGE_INFO.MI_RESET_PASSWORD_TOKEN_INVALID,
            }
        };
        res.header("Content-Type", "text/html; charset=UTF-8");
        let token = req.params.token || "";
        let password = `${Utils.randomPassword(PASSWORD_LENGTH)}`;
        let userId = "";
        return Promise.resolve()
            .then(() => {
                if (Jwt.verify(token, Jwt.DEFAULT_CLIENT)) {
                    let jwtObject = Jwt.decode(token);
                    let current = Date.now();
                    if (current < jwtObject.exp) {
                        let userId = jwtObject.payload.userId;
                        return UserService.findOne(userId);
                    }
                    email.data.content = MESSAGE_INFO.MI_RESET_PASSWORD_EXPIRED;
                }
            })
            .then(user => {
                if (user) {
                    email.data.firstName = user.firstName;
                    return UserService.setPassword(user.id, password);
                }
            })
            .then(user => {
                if (user) {
                    // send new password to user
                    Mailer.sendNewPassword(user, password);
                    email.data.content = MESSAGE_INFO.MI_CHECK_EMAIL_FOR_NEW_PASSWORD;
                }
                Mailer.generateCustomHtml(email)
                    .then((data: any) => {
                        res.send(data.html);
                    });
            })
            .catch((err) => {
                next(err);
            });
    }
}

export default TokensHandler;
