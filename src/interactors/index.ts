/**
 * Created by kiettv on 1/2/17.
 */

import AdvertiserSer from "./advertiser.service";
import AdvertisingCondoSer from "./advertising_condo.service";
import AdvertisingTemplateSer from "./advertising_template.service";
import AnnouncementSer from "./announcement.service";
import BanUserSer from "./ban_user.service";
import BookingSer from "./booking.service";
import PaymentGatewayManagerModule from "../interactors/payment_gateway_manager";
import CacheSer from "./cache.service";
import ClusteringSer from "./clustering.service";
import CondoRulesSer from "./condo_rules.service";
import CondoSer from "./condo.service";
import ContractSer from "./contract.service";
import CouncilMinutesSer from "./council_minutes.service";
import DeviceSer from "./device.service";
import EmailSer from "./email.service";
import FacilitySer from "./facilities.service";
import FeedSer from "./feed.service";
import FeedbackSer from "./feedback.service";
import FeedbackReplySer from "./feedback_reply.service";
import FunctionPasswordSer from "./function_password.service";
import GarageSaleSer from "./garage_sale.service";
import GetQuotationSer from "./get_quotation.service";
import HousingLoanSer from "./housing_loan.service";
import LatestTransactionSer from "./latest_transaction.service";
import MediaSer from "./media.service";
import OnlineFormSer from "./online_form.service";
import PaymentSourceSer from "./payment_source.service";
import PinSer from "./pin.service";
import RoleSer from "./role.service";
import SessionSer from "./session.service";
import ToolSer from "./tool.service";
import TransactionHistorySer from "./transaction_history.service";
import UsefulContactsCategorySer from "./useful_contacts_category.service";
import UserManagerSer from "./user_manager.service";
import UserSer from "./user.service";
import UserUnitSer from "./user_unit.service";
import WhatOnSer from "./what_on.service";
import PushNotificationSer from "./push_notification.service";
import UserSettingSer from "./user_setting.service";
import SellMyCarSer from "./sell_my_car.service";
import RatingAdvertisingTemplateSer from "./rating_advertising_template.service";
import SmsSer from "./sms.service";
import TodoSer from "./todo.service";
import MovingSer from "./moving.service";
import VariableSer from "./variable.service";
import WorkerSer from "./worker.service";

export const AdvertiserService = new AdvertiserSer();
export const AdvertisingCondoService = new AdvertisingCondoSer();
export const AdvertisingTemplateService = new AdvertisingTemplateSer();
export const AnnouncementService = new AnnouncementSer();
export const BanUserService = new BanUserSer();
export const BookingService = new BookingSer();
export const PaymentGatewayManager = new PaymentGatewayManagerModule();
export const CacheService = new CacheSer();
export const ClusteringService = new ClusteringSer();
export const CondoRulesService = new CondoRulesSer();
export const CondoService = new CondoSer();
export const ContractService = new ContractSer();
export const CouncilMinutesService = new CouncilMinutesSer();
export const DeviceService = new DeviceSer();
export const EmailService = new EmailSer();
export const FacilityService = new FacilitySer();
export const FeedService = new FeedSer();
export const FeedbackService = new FeedbackSer();
export const FeedbackReplyService = new FeedbackReplySer();
export const FunctionPasswordService = new FunctionPasswordSer();
export const GarageSaleService = new GarageSaleSer();
export const GetQuotationService = new GetQuotationSer();
export const HousingLoanService = new HousingLoanSer();
export const LatestTransactionService = new LatestTransactionSer();
export const MediaService = new MediaSer();
export const OnlineFormService = new OnlineFormSer();
export const PaymentSourceService = new PaymentSourceSer();
export const PinService = new PinSer();
export const RoleService = new RoleSer();
export const SessionService = new SessionSer();
export const SmsService = new SmsSer();
export const ToolService = new ToolSer();
export const TransactionHistoryService = new TransactionHistorySer();
export const UsefulContactsCategoryService = new UsefulContactsCategorySer();
export const UserManagerService = new UserManagerSer();
export const UserService = new UserSer();
export const UserUnitService = new UserUnitSer();
export const WhatOnService = new WhatOnSer();
export const PushNotificationService = new PushNotificationSer();
export const UserSettingService = new UserSettingSer();
export const SellMyCarService = new SellMyCarSer();
export const RatingAdvertisingTemplateService = new RatingAdvertisingTemplateSer();
export const TodoService = new TodoSer();
export const MovingService = new MovingSer();
export const VariableService = new VariableSer();
export const WorkerService = new WorkerSer();
