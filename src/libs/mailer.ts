/**
 * Created by kiettv on 12/18/16.
 */
import * as MailGun from "mailgun-js";
import * as Mailgen from "mailgen";
import * as Promise from "bluebird";
import * as _ from "lodash";
import * as fs from "fs";
import * as htmlToText from "html-to-text";
import * as path from "path";
import {EMAIL_TEMPLATE, MOMENT_DATE_FORMAT, TIME_ZONE, ROLE, ONLINE_FORM_SUB_CATEGORY} from "./constants";
import {FeedbackModel, BookingModel, EmailModel, OnlineFormRequestModel, UserModel, SellMyCarModel, UserUnitModel, CondoModel, UserManagerModel, FeedbackReplyModel, OnlineFormRequestItemsModel} from "../models";
import {Logger} from "./index";
import {Utils} from "./utils";

let templatesDir = path.resolve(__dirname, "..", "resources/email_templates");

interface MailerConf {
    generator: {
        name: string;
        link: string;
        logo: string;
        contactEmail: string;
    };
    mailGun: {
        apiKey: string;
        domain: string;
        sender: string;
    };
}

export class Mailer {
    private generator: Mailgen;
    private client: MailGun;
    private opts: MailerConf;

    constructor(opts: any) {
        let defaultConf = {
            generator: {
                name: "ventuso",
                link: "ventuso",
                logo: "ventuso",
                iOSAppUrl: "",
                androidAppUrl: "",
                privacyPolicyUrl: "",
                contactEmail: "support@ventuso.net"
            },
            mailGun: {
                apiKey: "ventuso",
                domain: "ventuso.net",
                sender: "support@ventuso.net"
            },
        };

        this.opts = _.defaultsDeep(opts, defaultConf) as MailerConf;

        this.generator = new Mailgen({
            theme: "default",
            product: {
                name: this.opts.generator.name,
                link: this.opts.generator.link,
                logo: this.opts.generator.logo,
            },
        });

        this.client = MailGun({apiKey: this.opts.mailGun.apiKey, domain: this.opts.mailGun.domain});
    }

    /**
     * @param jsonContent
     * @returns {any}
     */
    public generateHtml(jsonContent) {
        if (jsonContent == null || jsonContent === "") {
            throw new Error("Invalid JSON");
        }
        return this.generator.generate(jsonContent);
    }

    /**
     * @param options
     * @returns {Bluebird}
     */
    public generateCustomHtml(options: any) {
        let defaultData = this.opts.generator;
        let opts = this.cleanData(options.data);
        let data = _.merge(defaultData, opts);
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
        return new Promise(function (resolve, reject) {
            fs.readFile(templatesDir + "/" + options.template + ".html", {encoding: "utf8"}, function (err, fileContent) {
                if (err) {
                    reject(err);
                }

                try {
                    // insert user-specific data into the email
                    let template = _.template(fileContent);
                    let htmlContent = template(data);
                    // generate a plain-text version of the same email
                    let textContent = htmlToText.fromString(htmlContent);

                    resolve({
                        html: htmlContent,
                        text: textContent
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    };

    /**
     * clean data
     * @param options
     * @returns {any}
     */
    public cleanData(options: any) {
        _.each(options, (value, key) => {
            if (options[key] === null || options[key] === undefined) {
                options[key] = "";
            }
        });
        return options;
    }

    /**
     * @param toEmail
     * @param title
     * @param jsonContent
     * @returns {any}
     */
    public send(toEmail: string, title: string, jsonContent: any): Promise<any> {
        if (jsonContent == null || jsonContent === "") {
            return Promise.reject(new Error("Invalid JSON"));
        }

        let message = {
            from: this.opts.mailGun.sender,
            to: toEmail,
            subject: title,
            html: this.generator.generate(jsonContent),
        };

        return new Promise((resolve, reject) => {
            this.client.messages().send(message, (err, body) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    }

    /**
     *
     * @param toEmail
     * @param title
     * @param jsonContent
     * @returns {any}
     */
    public sendCustomHtml(toEmail: string, title: string, options: any): Promise<any> {
        return this.generateCustomHtml(options)
            .then((res: any) => {
                let message = {
                    from: options.from ? options.from : this.opts.mailGun.sender,
                    to: toEmail,
                    subject: title,
                    html: res.html,
                };
                return new Promise((resolve, reject) => {
                    this.client.messages().send(message, (err, body) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve(body);
                        }
                    });
                });
            })
            .catch(error => {
                Logger.error(`Send email to ${toEmail} with error:` + error.message, error);
                return Promise.resolve();
            });
    }

    /**
     * @param toEmail
     * @param receiverName
     * @param resetLink
     * @returns {Promise<any>}
     */
    // public resetPassword(toEmail, receiverName, resetLink) {
    //     let message = {
    //         body: {
    //             name: receiverName,
    //             intro: "You have received this email because a password reset request for your account was received.",
    //             action: {
    //                 instructions: "Click the button below to reset your password:",
    //                 button: {
    //                     color: "red",
    //                     text: "Reset your password",
    //                     link: resetLink,
    //                 },
    //             },
    //             outro: "If you did not request a password reset, no further action is required on your part.",
    //         },
    //     };
    //
    //     return this.send(toEmail, "Message from iCondo", message);
    // }

    /**
     * @param toEmail
     * @param receiverName
     * @param password
     * @returns {Promise<any>}
     */
    // public sendNewPassword(toEmail, receiverName, password) {
    //     let message = {
    //         body: {
    //             name: receiverName,
    //             intro: "Your new password has been created.",
    //             action: {
    //                 instructions: "Please use this new password to login and change password as soon as possible.",
    //                 button: {
    //                     color: "blue",
    //                     text: password,
    //                 },
    //             },
    //             outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
    //         },
    //     };
    //
    //     return this.send(toEmail, "Message from iCondo", message);
    // }

    /**
     * @param email
     * @param mobilePhone
     * @param pinCode
     * @returns {Bluebird<U>}
     */
    // public sendPinForTester(email, mobilePhone, pinCode) {
    //     let message = {
    //         body: {
    //             name: "Verify Pin",
    //             intro: `Your pin of mobile phone:`,
    //             action: {
    //                 instructions: `Your pin of mobile phone ${mobilePhone}`,
    //                 button: {
    //                     color: "blue",
    //                     text: pinCode,
    //                 },
    //             },
    //             outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
    //         },
    //     };
    //
    //     return Promise.resolve()
    //         .then(() => {
    //             return this.send(email, "Message from iCondo", message);
    //         });
    //
    //
    // }

    /**
     * @param toEmail
     * @param intro
     * @returns {Promise<any>}
     */
    // public sendRequestQuote(toEmail, intro) {
    //     let message = {
    //         body: {
    //             name: "Request Quote",
    //             intro: "Send mail request quote",
    //             outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
    //         },
    //     };
    //
    //     return this.send(toEmail, "Message from iCondo", message);
    // }

    /**
     * send welcome message when user has been approved
     * @param data
     */
    public sendWelcomeToCondo(userModel: UserModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.WELCOME_TO_CONDO,
                    data: {
                        firstName: userModel.firstName,
                    }
                };
                return this.sendCustomHtml(userModel.email, "Welcome to iCondo!", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userModel.email}`, error);
            });
    }

    /**
     * send thank you to owner
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendOwnerApplicationSubmit(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.OWNER_APPLICATION_TO_CONDO_RECEIVED,
                    data: {
                        firstName: userUnitModel.user.firstName,
                        condoName: userUnitModel.condo.name,
                        condoEmail: userUnitModel.condo.newUserEmail,
                    }
                };
                return this.sendCustomHtml(userUnitModel.user.emailContact, `Application to ${ userUnitModel.condo.name} - Received`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${ userUnitModel.user.emailContact}`, error);
            });
    }

    /**
     * send new owner submit to condo manager
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendNewUserApplicationReceivedOwner(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.NEW_USER_APPLICATION_RECEIVED_OWNER,
                    data: {
                        fullName: userUnitModel.user.firstName + " " + userUnitModel.user.lastName,
                        email: userUnitModel.user.email,
                        phoneNumber: userUnitModel.user.phoneNumber,
                        roleId: userUnitModel.user.roleId,
                        unitNumber: `#${userUnitModel.unit.floor.floorNumber}-${userUnitModel.unit.stackNumber}`,
                        block: userUnitModel.unit.floor.block.blockNumber,
                    }
                };
                return this.sendCustomHtml(userUnitModel.condo.newUserEmail, `NEW user application received - OWNER`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userUnitModel.condo.newUserEmail}`, error);
            });
    }

    /**
     * send thank you to tenant
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendTenantApplicationSubmit(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.TENTANT_APPLICATION_TO_CONDO_RECEIVED,
                    data: {
                        firstName: userUnitModel.user.firstName,
                        condoName: userUnitModel.condo.name,
                        condoEmail: userUnitModel.condo.newUserEmail,
                    }
                };
                return this.sendCustomHtml(userUnitModel.user.emailContact, `Application to ${ userUnitModel.condo.name} - Received`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${ userUnitModel.user.emailContact}`, error);
            });
    }


    /**
     * send new tenant submit to condo manager
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendNewUserApplicationReceivedTenant(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.NEW_USER_APPLICATION_RECEIVED_OWNER,
                    data: {
                        fullName: userUnitModel.user.firstName + " " + userUnitModel.user.lastName,
                        email: userUnitModel.user.email,
                        phoneNumber: userUnitModel.user.phoneNumber,
                        roleId: userUnitModel.user.roleId,
                        unitNumber: `#${userUnitModel.unit.floor.floorNumber}-${userUnitModel.unit.stackNumber}`,
                        block: userUnitModel.unit.floor.block.blockNumber,
                    }
                };
                return this.sendCustomHtml(userUnitModel.condo.newUserEmail, `NEW user application received - TENANT`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userUnitModel.condo.newUserEmail}`, error);
            });
    }

    /**
     * send email to user that condo manager approved
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendCondoManagerApproved(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.CONDO_MANAGER_APPROVE,
                    data: {
                        firstName: userUnitModel.user.firstName,
                        condoName: userUnitModel.condo.name,
                        condoManager: userUnitModel.condo.manager[0].firstName,
                    }
                };
                return this.sendCustomHtml(userUnitModel.user.emailContact, `Welcome to iCondo!`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userUnitModel.user.emailContact}`, error);
            });
    }

    /**
     * send email to user that condo manager rejected
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendCondoManagerRejected(userUnitModel: UserUnitModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.APPLICATION_HAS_BEEN_REJECTED,
                    data: {
                        condoName: userUnitModel.condo.name,
                    }
                };
                return this.sendCustomHtml(userUnitModel.user.emailContact, `Ooops!`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userUnitModel.user.emailContact}`, error);
            });
    }

    /**
     * send reset message
     * @param userModel
     * @param resetLink
     * @returns {Promise<any>}
     */
    public sendResetPassword(userModel: UserModel, resetLink): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.RESET_PASSWORD,
                    data: {
                        resetLink: resetLink,
                    }
                };
                return this.sendCustomHtml(userModel.email, `Reset your password`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userModel.emailContact}`, error);
            });
    }

    /**
     * send new password
     * @param userModel
     * @param newPassword
     * @returns {Promise<any>}
     */
    public sendNewPassword(userModel: UserModel, newPassword): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.NEW_PASSWORD,
                    data: {
                        firstName: userModel.firstName,
                        newPassword: newPassword,
                    }
                };
                return this.sendCustomHtml(userModel.emailContact, `NEW password`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userModel.emailContact}`, error);
            });
    }

    /**
     * Housing Loan Request - Received
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendHousingLoanRequest(userModel: UserModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.HOUSING_LOAN_REQUEST_RECEIVED,
                    data: {
                        firstName: userModel.firstName,
                    }
                };
                return this.sendCustomHtml(userModel.emailContact, "Housing Loan Request - Received", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userModel.emailContact}`, error);
            });
    }

    /**
     * NEW Housing Loan Request
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendNewHousingLoanRequest(toEmail: string, userModel: UserModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.NEW_HOUSING_LOAN_REQUEST,
                    data: {
                        fullName: userModel.firstName + " " + userModel.lastName,
                        email: userModel.email,
                        phoneNumber: userModel.phoneNumber,
                        unitNumber: `#${userModel.unit.floor.floorNumber}-${userModel.unit.stackNumber}`,
                        block: userModel.unit.floor.block.blockNumber,
                        condoName: userModel.condo.name,
                    }
                };
                return this.sendCustomHtml(toEmail, "NEW Housing Loan Request", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${toEmail}`, error);
            });
    }

    /**
     * New feedback received
     * @param toEmail
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendNewFeedbackReceived(feedbackModel: FeedbackModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let image1: string = "";
                let image2: string = "";
                let image3: string = "";
                if (feedbackModel.images && feedbackModel.images.length > 0) {
                    if (feedbackModel.images.length === 1) {
                        image1 = feedbackModel.images[0];
                    }

                    if (feedbackModel.images.length === 2) {
                        image1 = feedbackModel.images[0];
                        image2 = feedbackModel.images[1];
                    }

                    if (feedbackModel.images.length === 3) { // maximum 3 images
                        image1 = feedbackModel.images[0];
                        image2 = feedbackModel.images[1];
                        image3 = feedbackModel.images[2];
                    }
                }
                let obj = {
                    template: EMAIL_TEMPLATE.FEEDBACK_RECEIVED_EMAIL_TO_CONDO_MAMAGER,
                    data: {
                        fullName: feedbackModel.user.firstName + " " + feedbackModel.user.lastName,
                        email: feedbackModel.user.email,
                        phoneNumber: feedbackModel.user.phoneNumber,
                        unitNumber: `#${feedbackModel.user.unit.floor.floorNumber}-${feedbackModel.user.unit.stackNumber}`,
                        block: feedbackModel.user.unit.floor.block.blockNumber,
                        title: feedbackModel.title,
                        content: feedbackModel.content,
                        dateReceived: Utils.dateByFormat(feedbackModel.dateReceived.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, feedbackModel.condo.timezone),
                        image1: image1,
                        image2: image2,
                        image3: image3,
                    }
                };
                let toEmails = [];
                if (feedbackModel.condo && feedbackModel.condo.feedbackEmail) {
                    toEmails.push(feedbackModel.condo.feedbackEmail);
                }
                if (feedbackModel.category && feedbackModel.category.email) {
                    toEmails.push(feedbackModel.category.email);
                }
                return Promise.each(toEmails, (toEmail => {
                    return this.sendCustomHtml(toEmail, "New feedback received", obj);
                }));
            })
            .catch(error => {
                Logger.error(`Send new feedback received error: `, error);
            });
    }

    /**
     * Feedback Received - Thank You
     * @param toEmail
     * @param feedbackModel
     * @returns {Promise<any>}
     */
    public sendFeedbackReceivedThankYou(feedbackModel: FeedbackModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let image1: string = "";
                let image2: string = "";
                let image3: string = "";
                if (feedbackModel.images && feedbackModel.images.length > 0) {
                    if (feedbackModel.images.length === 1) {
                        image1 = feedbackModel.images[0];
                    }

                    if (feedbackModel.images.length === 2) {
                        image1 = feedbackModel.images[0];
                        image2 = feedbackModel.images[1];
                    }

                    if (feedbackModel.images.length === 3) { // maximum 3 images
                        image1 = feedbackModel.images[0];
                        image2 = feedbackModel.images[1];
                        image3 = feedbackModel.images[2];
                    }
                }
                let obj = {
                    template: EMAIL_TEMPLATE.FEEDBACK_RECEIVED_EMAIL_TO_USER,
                    data: {
                        firstName: feedbackModel.user.firstName,
                        email: feedbackModel.user.email,
                        phoneNumber: feedbackModel.user.phoneNumber,
                        unitNumber: `#${feedbackModel.user.unit.floor.floorNumber}-${feedbackModel.user.unit.stackNumber}`,
                        block: feedbackModel.user.unit.floor.block.blockNumber,
                        title: feedbackModel.title,
                        content: feedbackModel.content,
                        image1: image1,
                        image2: image2,
                        image3: image3,
                        condoManager: feedbackModel.condo.manager[0].firstName,
                    }
                };
                return this.sendCustomHtml(feedbackModel.user.emailContact, "Feedback Received - Thank You", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${feedbackModel.user.emailContact}`, error);
            });
    }

    public sendAccessCardReceivedToManager(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.ONLINE_FORM_ACCESS_CARD_RECEIVED_TO_CONDO_MANAGER,
                    data: {
                        fullName: onlineForm.user.firstName + " " + onlineForm.user.lastName,
                        email: onlineForm.user.email,
                        phoneNumber: onlineForm.user.phoneNumber,
                        unitNumber: `#${onlineForm.user.unit.floor.floorNumber}-${onlineForm.user.unit.stackNumber}`,
                        block: onlineForm.user.unit.floor.block.blockNumber,
                        transactionId: onlineForm.transactionId,
                        numberOfItems: 1,
                        total: `$${onlineForm.price}`,
                        createdDate: Utils.dateByFormat(onlineForm.createdDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, onlineForm.user.condo.timezone),
                    }
                };
                return this.sendCustomHtml(onlineForm.user.condo.onlineFormEmail, "NEW Access Card Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.condo.onlineFormEmail}`, error);
            });
    }

    public sendAccessCardApproved(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_ACCESS_CARD_APPROVED;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        condoName: onlineForm.user.condo.name,
                        transactionId: onlineForm.transactionId,
                        numberOfItems: 1,
                        total: `$${onlineForm.price}`,
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, "Access Card Application - Approved", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }

    public sendCarTransponderReceivedToManager(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.ONLINE_FORM_CAR_TRANSPONDER_RECEIVED_TO_CONDO_MANAGER,
                    data: {
                        fullName: onlineForm.user.firstName + " " + onlineForm.user.lastName,
                        email: onlineForm.user.email,
                        phoneNumber: onlineForm.user.phoneNumber,
                        unitNumber: `#${onlineForm.user.unit.floor.floorNumber}-${onlineForm.user.unit.stackNumber}`,
                        block: onlineForm.user.unit.floor.block.blockNumber,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                        createdDate: Utils.dateByFormat(onlineForm.createdDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, onlineForm.user.condo.timezone),
                    }
                };
                return this.sendCustomHtml(onlineForm.user.condo.onlineFormEmail, "NEW Car Transponder Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.condo.onlineFormEmail}`, error);
            });
    }

    public sendCarTransponderApproved(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_CAR_TRANSPONDER_APPROVED;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        condoName: onlineForm.user.condo.name,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, "Car Transponder Application - Approved", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }

    public sendCarLabelReceivedToManager(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.ONLINE_FORM_CAR_LABEL_RECEIVED_TO_CONDO_MANAGER,
                    data: {
                        fullName: onlineForm.user.firstName + " " + onlineForm.user.lastName,
                        email: onlineForm.user.email,
                        phoneNumber: onlineForm.user.phoneNumber,
                        unitNumber: `#${onlineForm.user.unit.floor.floorNumber}-${onlineForm.user.unit.stackNumber}`,
                        block: onlineForm.user.unit.floor.block.blockNumber,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                        createdDate: Utils.dateByFormat(onlineForm.createdDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, onlineForm.user.condo.timezone),
                    }
                };
                return this.sendCustomHtml(onlineForm.user.condo.onlineFormEmail, "NEW Car Label Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.condo.onlineFormEmail}`, error);
            });
    }

    public sendCarLabelApproved(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_CAR_LABEL_APPROVED;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        condoName: onlineForm.user.condo.name,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, "Car Label Application - Approved", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }

    public sendIURegistrationReceivedToManager(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.ONLINE_FORM_CAR_IU_REGISTRATION_RECEIVED_TO_CONDO_MANAGER,
                    data: {
                        fullName: onlineForm.user.firstName + " " + onlineForm.user.lastName,
                        email: onlineForm.user.email,
                        phoneNumber: onlineForm.user.phoneNumber,
                        unitNumber: `#${onlineForm.user.unit.floor.floorNumber}-${onlineForm.user.unit.stackNumber}`,
                        block: onlineForm.user.unit.floor.block.blockNumber,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                        iuNumber: onlineForm.iuNumber,
                        createdDate: Utils.dateByFormat(onlineForm.createdDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, onlineForm.user.condo.timezone),
                    }
                };
                return this.sendCustomHtml(onlineForm.user.condo.onlineFormEmail, "NEW IU Registration Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.condo.onlineFormEmail}`, error);
            });
    }

    public sendIURegistrationApproved(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_CAR_IU_REGISTRATION_APPROVED;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        condoName: onlineForm.user.condo.name,
                        transactionId: onlineForm.transactionId,
                        total: `$${onlineForm.price}`,
                        vehicleNumber: onlineForm.vehicleNumber,
                        iuNumber: onlineForm.iuNumber,
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, "Car IU Registration - Approved", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }

    public sendBicycleTagReceivedToManager(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.ONLINE_FORM_BICYCLE_TAG_RECEIVED_TO_CONDO_MANAGER,
                    data: {
                        fullName: onlineForm.user.firstName + " " + onlineForm.user.lastName,
                        email: onlineForm.user.email,
                        phoneNumber: onlineForm.user.phoneNumber,
                        unitNumber: `#${onlineForm.user.unit.floor.floorNumber}-${onlineForm.user.unit.stackNumber}`,
                        block: onlineForm.user.unit.floor.block.blockNumber,
                        numberOfItems: 1,
                        createdDate: Utils.dateByFormat(onlineForm.createdDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE_TIME, onlineForm.user.condo.timezone),
                    }
                };
                return this.sendCustomHtml(onlineForm.user.condo.onlineFormEmail, "NEW Bicycle Tag Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.condo.onlineFormEmail}`, error);
            });
    }

    public sendBicycleTagApproved(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_BICYCLE_TAG_APPROVED;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        condoName: onlineForm.user.condo.name,
                        total: `$${onlineForm.price}`,
                        numberOfItems: 1,
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, "Bicycle Tag - Approved", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }

    public sendFacilityBookingConfirmed(bookingModel: BookingModel, receiptNumber: string = "", sendAdmin: boolean = false): Promise<any> {
        let unitNumber = "ADMIN";
        if (bookingModel.unit && bookingModel.unit.unitNumber) {
            unitNumber = bookingModel.unit.unitNumber;
        }
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.FACILITY_BOOKING_PAYMENT_ON,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: receiptNumber,
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name,
                        unitNumber: unitNumber
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Confirmed", obj)
                .then(() => {
                    if (sendAdmin === true && bookingModel.condo.bookingEmail) {
                        return this.sendCustomHtml(bookingModel.condo.bookingEmail, "Facility Booking - Confirmed", obj);
                    } else {
                        return true;
                    }
                });
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * Facility Booking - Pending
     * @param bookingModel
     * @returns {Promise<any>}
     */
    public sendFacilityBookingPending(bookingModel: BookingModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.FACILITY_BOOKING_PENDING_PAYMENT_SYSTEM,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: "",
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Pending", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * Facility Booking - Cancelled
     * @param bookingModel
     * @returns {Promise<any>}
     */
    public sendFacilityBookingCancelled(bookingModel: BookingModel, sendAdmin: boolean = false): Promise<any> {
        let receiptNo: string = "";
        let template = EMAIL_TEMPLATE.FACILITY_BOOKING_CANCELLED;
        if (bookingModel.payByCash === false) {
            if (bookingModel.transaction) {
                receiptNo = bookingModel.transaction.transactionId;
            }
        } else {
            template = EMAIL_TEMPLATE.FACILITY_BOOKING_CANCELLED_PAY_BY_CASH;
        }
        let unitNumber = "ADMIN";
        if (bookingModel.unit && bookingModel.unit.unitNumber) {
            unitNumber = bookingModel.unit.unitNumber;
        }
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: receiptNo,
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name,
                        unitNumber: unitNumber
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Cancelled", obj)
                .then(() => {
                    if (sendAdmin === true && bookingModel.condo.bookingEmail) {
                        return this.sendCustomHtml(bookingModel.condo.bookingEmail, "Facility Booking - Cancelled", obj);
                    } else {
                        return true;
                    }
                });
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * Facility Booking - Confirmed No Payment Needed
     * @param bookingModel
     * @returns {Promise<any>}
     */
    public sendFacilityBookingConfirmedNoPaymentNeeded(bookingModel: BookingModel, sendAdmin: boolean = false): Promise<any> {
        let unitNumber = "ADMIN";
        if (bookingModel.unit && bookingModel.unit.unitNumber) {
            unitNumber = bookingModel.unit.unitNumber;
        }
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.FACILITY_BOOKING_PAYMENT_ON,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: "",
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name,
                        unitNumber: unitNumber
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Confirmed", obj)
                .then(() => {
                    if (sendAdmin === true && bookingModel.condo.bookingEmail) {
                        return this.sendCustomHtml(bookingModel.condo.bookingEmail, "Facility Booking - Confirmed", obj);
                    } else {
                        return true;
                    }
                });
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * 3G - Facilities Booking - Deposit Returned
     * @param bookingModel
     * @returns {Bluebird<U>}
     */
    public sendFacilityBookingDepositReturned(bookingModel: BookingModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.FACILITY_BOOKING_DEPOSIT_RETURNED,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: "",
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Deposit Returned", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * 3F - Facilities Booking - Deposit Forfeited
     * @param bookingModel
     * @returns {Bluebird<U>}
     */
    public sendFacilityBookingDepositForfeited(bookingModel: BookingModel, receiptNumber: string = ""): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.FACILITY_BOOKING_DEPOSIT_FORFEITED,
                    data: {
                        firstName: bookingModel.user.firstName,
                        condoName: bookingModel.condo.name,
                        paymentAmount: `$${bookingModel.paymentAmount}`,
                        depositAmount: `$${bookingModel.depositAmount}`,
                        receiptNo: receiptNumber,
                        eventStartDate: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.SEND_MAIL_FULL_DATE, bookingModel.condo.timezone),
                        startTime: Utils.dateByFormat(bookingModel.eventStartDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        endTime: Utils.dateByFormat(bookingModel.eventEndDate.toISOString(), MOMENT_DATE_FORMAT.HH_MM_A, bookingModel.condo.timezone),
                        slotName: bookingModel.items[0].facility.name + " " + bookingModel.items[0].slot.name
                    }
                };
                return this.sendCustomHtml(bookingModel.user.emailContact, "Facility Booking - Deposit Forfeited", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${bookingModel.user.emailContact}`, error);
            });
    }

    /**
     * Sell My Car Application - Received
     * @param onlineForm
     * @returns {Promise<any>
     */
    public sendSellMyCarRequestReceived(userModel: UserModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.SELL_MY_CAR_REQUEST,
                    data: {
                        firstName: userModel.firstName,
                    }
                };
                return this.sendCustomHtml(userModel.email, "Sell My Car Request - Received", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${userModel.email}`, error);
            });
    }

    /**
     * NEW Sell My Car Application
     * @param onlineForm
     * @returns {Promise<any>}
     */
    public sendNewSellMyCarRequest(toEmail: string, userModel: UserModel, sellMyCar: SellMyCarModel): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.SELL_MY_CAR_REQUEST_EMAIL_TO_CONDO_MANAGER,
                    data: {
                        fullName: userModel.firstName + " " + userModel.lastName,
                        email: userModel.email,
                        phoneNumber: userModel.phoneNumber,
                        unitNumber: `#${userModel.unit.floor.floorNumber}-${userModel.unit.stackNumber}`,
                        block: userModel.unit.floor.block.blockNumber,
                        vehicleNumber: sellMyCar.vehicleNumber,
                        vehicleMilage: sellMyCar.vehicleMilage,
                        passportNumber: sellMyCar.passportNumber
                    }
                };
                return this.sendCustomHtml(toEmail, "NEW Sell My Car Application", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${toEmail}`, error);
            });
    }

    /**
     * send custom email
     * @param subject
     * @param content
     * @param userModel
     * @returns {Promise<any>}
     */

    public sendCustomEmailByManager(message: EmailModel, toEmail: string, userManager: UserManagerModel): Promise<any> {
        let manager = userManager.user || null;
        let condo = userManager.condo || null;
        let fromEmail = manager.emailContact || condo.email;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    from: `${Utils.camelCaseString(condo.name)} <${fromEmail}>`,
                    template: EMAIL_TEMPLATE.SEND_CUSTOM_EMAIL_BY_MANAGER,
                    data: {
                        body: message.content,
                        firstName: manager.firstName,
                        lastName: manager.lastName,
                        condoName: Utils.camelCaseString(condo.name),
                        mcstNumber: condo.mcstNumber,
                        officePhone1: manager.contactNumber,
                        email: fromEmail,
                        address1: condo.address1,
                        address2: condo.address2
                    }
                };
                return this.sendCustomHtml(toEmail, message.subject, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${toEmail}`, error);
            });
    }

    /**
     *
     * @param toEmail
     * @param data
     * @returns {Bluebird<U>}
     */
    public sendNewCondoRequest(data: any): Promise<any> {
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: EMAIL_TEMPLATE.NEW_CONDO_REQUEST,
                    data: {
                        condoName: data.condoName ? data.condoName : "",
                        phoneNumber: data.phoneNumber ? data.phoneNumber : "",
                        email: data.email ? data.email : "",
                    }
                };
                return this.sendCustomHtml(this.opts.generator.contactEmail, "NEW Condo Request", obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${this.opts.generator.contactEmail}`, error);
            });
    }

    public sendOnlineFormRejected(onlineFormRequest: OnlineFormRequestItemsModel, userManager: UserModel) {
        let onlineFormName = onlineFormRequest.onlineFormSubCategory.category.name;
        if (onlineFormRequest.onlineFormSubCategory.subTemplateId !== ONLINE_FORM_SUB_CATEGORY.NO_TYPE) {
            onlineFormName +=  " - " + onlineFormRequest.onlineFormSubCategory.name;
        }
        let obj = {
            template: EMAIL_TEMPLATE.ONLINE_FORM_REJECTED,
            data: {
                firstName: onlineFormRequest.user.firstName,
                onlineFormName: onlineFormName,
                managerName: `${userManager.firstName} ${userManager.lastName}`,
                managerPhone: userManager.phoneNumber
            }
        };
        return this.sendCustomHtml(onlineFormRequest.user.email, `${onlineFormName} Application - Unsuccessful`, obj)
        .catch(err => {
            Logger.error(`Send mail to ${onlineFormRequest.user.emailContact}`, err);
        });
    }

    public sendRemindTenancyExpiry(userUnit: UserUnitModel, userManager: UserManagerModel) {
        let obj = {
            template: EMAIL_TEMPLATE.TENANCY_EXPIRY_REMINDER,
            data: {
                from: userUnit.condo.email,
                firstName: userUnit.user.firstName,
                condoName: userUnit.condo.name,
                expiredDate: Utils.dateByFormat(userUnit.tenancyExpiry.toISOString(), MOMENT_DATE_FORMAT.DD_MM_YYYY, userUnit.condo.timezone),
                condoManagerName: `${userManager.user.firstName} ${userManager.user.lastName}`
            }
        };
        return this.sendCustomHtml(userUnit.user.emailContact, `iCondo - Tenancy Expiry`, obj)
        .catch(err => {
            Logger.error(`Send mail to ${userUnit.user.emailContact}`, err);
        });
    }

    /**
     * feedback resolved
     * @param toEmail
     * @param userModel
     * @returns {Promise<any>}
     */
    public sendFeedbackResolved(feedbackModel: FeedbackModel): Promise<any> {
        let image1: string = "";
        let image2: string = "";
        let image3: string = "";
        let timezone: string = TIME_ZONE.TIME_ZONE_DEFAULT;
        let manager: UserModel;
        let managerFirstname: string;
        let condoManagerRole: string = "Condominium Manager";

        if (feedbackModel.condo) {
            timezone = feedbackModel.condo.timezone;
            if (feedbackModel.condo.manager && feedbackModel.condo.manager[0]) {
                manager = feedbackModel.condo.manager[0];
                managerFirstname = manager.firstName;
                condoManagerRole = manager.customUserRole ? manager.customUserRole : "Condominium Manager";
            }
        }
        if (feedbackModel.images && feedbackModel.images.length > 0) {
            if (feedbackModel.images.length === 1) {
                image1 = feedbackModel.images[0];
            }

            if (feedbackModel.images.length === 2) {
                image1 = feedbackModel.images[0];
                image2 = feedbackModel.images[1];
            }

            if (feedbackModel.images.length === 3) { // maximum 3 images
                image1 = feedbackModel.images[0];
                image2 = feedbackModel.images[1];
                image3 = feedbackModel.images[2];
            }
        }
        let obj = {
            template: EMAIL_TEMPLATE.FEEDBACK_RESOLVED_TO_USER,
            data: {
                fullName: feedbackModel.user.firstName + " " + feedbackModel.user.lastName,
                title: feedbackModel.title,
                content: feedbackModel.content,
                note: feedbackModel.note,
                condoManagerName: managerFirstname,
                condoManagerRole: condoManagerRole,
                image1: image1,
                image2: image2,
                image3: image3,
                replyContent: this.generateFeedbackReply(feedbackModel.replies, timezone)
            }
        };
        let toEmails = [];
        toEmails.push(feedbackModel.user.email);
        if (feedbackModel.condo) {
            toEmails.push(feedbackModel.condo.feedbackEmail);
        }
        if (feedbackModel.category && feedbackModel.category.email) {
            toEmails.push(feedbackModel.category.email);
        }
        return Promise.each(toEmails, (toEmail => {
            return this.sendCustomHtml(toEmail, "Feedback Resolved - " + feedbackModel.title, obj);
        }))
        .catch(error => {
            Logger.error(`Send Feedback Resolved error: `, error);
        });
    }

    public generateFeedbackReply(feedbackReplies: FeedbackReplyModel[], timezone: string): string {
        let replyContent: string = "";
        feedbackReplies.forEach(reply => {
            let imageReply1Left: string = "";
            let imageReply1Right: string = "";
            let imageReply2Left: string = "";
            let imageReply2Right: string = "";
            let imageReply3Left: string = "";
            let imageReply3Right: string = "";

            if (reply.images && reply.images.length > 0) {
                if (reply.images.length === 1) {
                    imageReply1Left = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply1Right = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                }

                if (reply.images.length === 2) {
                    imageReply1Left = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply1Right = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply2Left = `<img border="0" class="" hspace="0" src="${reply.images[1]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply2Right = `<img border="0" class="" hspace="0" src="${reply.images[1]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                }

                if (reply.images.length === 3) {
                    imageReply1Left = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply1Right = `<img border="0" class="" hspace="0" src="${reply.images[0]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply2Left = `<img border="0" class="" hspace="0" src="${reply.images[1]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply2Right = `<img border="0" class="" hspace="0" src="${reply.images[1]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply3Left = `<img border="0" class="" hspace="0" src="${reply.images[2]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                    imageReply3Right = `<img border="0" class="" hspace="0" src="${reply.images[2]}" alt="" style="display: block; height: auto; max-width: 100%;" vspace="0">`;
                }
            }

            let side = "";
            let avatarPadding = "";
            let content = reply.content || "";
            if (reply.user.roleId === ROLE.CONDO_MANAGER) {
                side = "right";
                avatarPadding = "0px 0px 10px 10px";
                imageReply1Left = "";
                imageReply2Right = "";
                imageReply3Left = "";
            } else {
                side = "left";
                avatarPadding = "0px 10px 10px 0px";
                imageReply1Right = "";
                imageReply2Left = "";
                imageReply3Right = "";
            }

            let html = `<div>
                    <div style="border-top: 2px solid #e5e5e5; padding: 20px 10px; padding-left:0px; padding-right: 0px;">
                        <div>
                            <div class="avatar" style="text-align: ${side}; float:${side}; padding: ${avatarPadding};"><img src="${reply.user.avatarUrl}" style="width:50px; height:50px; border-radius:50%; border: 1px solid #e5e5e5;"/></div>
                            <div style="text-align: ${side}; float:${side}">
                                <div class="user-info">
                                    <h3 style="color:#5bc6cc; margin: 0; font-size: 18px">${reply.user.firstName}</h3>
                                    <span>${Utils.dateByFormat(reply.createdDate.toISOString(), MOMENT_DATE_FORMAT.DD_MMMM_YYYY_hh_mm_A, timezone)}</span>
                                </div>
                            </div>
                        </div>
                        <div style="clear: both"></div>
                        <div class="message" style="text-align:${side};">${content}</div>
                        <div style="clear: both"></div>
                        <div>
                            <table style="text-align:${side};" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                    <tr>
                                        <td style="padding: 10px 10px 10px 0px;" align="left" class="two-column OneColumnMobile column-left" valign="top" width="50%">
                                            ${imageReply1Left}
                                            ${imageReply2Left}
                                        </td>
                                        <td style="padding: 10px 0px 10px 10px;" align="left" class="two-column OneColumnMobile column-right" valign="top" width="50%">
                                            ${imageReply1Right}
                                            ${imageReply2Right}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 10px 10px 0px;" align="left" class="two-column OneColumnMobile column-left" valign="top" width="50%">
                                            ${imageReply3Left}
                                        </td>
                                        <td style="padding: 10px 0px 10px 10px;" align="left" class="two-column OneColumnMobile column-right" valign="top" width="50%">
                                            ${imageReply3Right}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>`;
            replyContent += html;
        });
        return replyContent;
    }

    public sendOnlineFormReceived(onlineForm: OnlineFormRequestItemsModel): Promise<any> {
        let template = EMAIL_TEMPLATE.ONLINE_FORM_RECEIVED_PAYMENT_ON;
        if (onlineForm.user.condo.payByCash === true) {
            template = EMAIL_TEMPLATE.ONLINE_FORM_RECEIVED_PAYMENT_OFF;
        }
        let onlineFormName = onlineForm.onlineFormSubCategory.category.name;
        if (onlineForm.onlineFormSubCategory.subTemplateId !== ONLINE_FORM_SUB_CATEGORY.NO_TYPE) {
            onlineFormName +=  " - " + onlineForm.onlineFormSubCategory.name;
        }
        let oneOnlineFormName = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"].indexOf(onlineFormName[0]) < 0 ? `a ${onlineFormName}` : `an ${onlineFormName}`;
        return Promise.resolve()
            .then(() => {
                let obj = {
                    template: template,
                    data: {
                        firstName: onlineForm.user.firstName,
                        oneOnlineFormName: oneOnlineFormName
                    }
                };
                return this.sendCustomHtml(onlineForm.user.emailContact, `${onlineFormName} - Received`, obj);
            })
            .catch(error => {
                Logger.error(`Send mail to ${onlineForm.user.emailContact}`, error);
            });
    }
}

export default Mailer;
