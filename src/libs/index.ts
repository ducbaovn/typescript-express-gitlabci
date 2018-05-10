/**
 * Created by kiettv on 12/16/16.
 */
import ConfigurationModule from "./config";
import HttpCode from "./http_code";
import JwtModule from "./jwt";
import LogModule from "./logger";
import { I18N as I18nModule, Language as Lang } from "./languages";
import MailModule from "./mailer";
import Error from "./error_code";
import SMSModule from "./sms";
import BrainTreeSDK from "./braintree";
import UploaderModule from "./uploader";
import FirebaseSDK from "./firebase";
import FCMModule from "./fcm";
import StripeSDK from "./stripe";
import SchedulerModule from "./scheduler";

export * from "./utils";
export * from "./moment_range";
export * from "./mapper";
// Constants
export const HttpStatus = HttpCode;
export const LANGUAGE = Lang;

// Libraries
export const Configuration = ConfigurationModule.loadSetting();
export const Logger = new LogModule(Configuration.log);
export const I18N = new I18nModule();
export const Jwt = new JwtModule();
export const Mailer = new MailModule(Configuration.mailer);
export const SMS = new SMSModule(Configuration.sms);
export const ErrorCode = Error;
export const BrainTree = new BrainTreeSDK(Configuration.payment.brainTree);
export const Uploader = new UploaderModule(Configuration.storage);
export const FirebaseAdmin = new FirebaseSDK(Configuration.database ? Configuration.database.firebase : {});
export const FCMNotify = new FCMModule(Configuration.fcm);
export const Stripe = new StripeSDK(Configuration.payment.stripe);
export const Scheduler = new SchedulerModule(Configuration.scheduler, Logger);
