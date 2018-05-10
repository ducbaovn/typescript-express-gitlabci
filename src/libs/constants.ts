/**
 * Created by kiettv on 1/3/17.
 */
export const IS_FORCE = true;

/**
 * Define time-zone default
 */
export const TIME_ZONE = {
    TIME_ZONE_DEFAULT: "Asia/Singapore",
    TIME_ZONE_VN: "Asia/Ho_Chi_Minh",
    TIME_ZONE_UTC: "UTC",
};

export const EXTENDED_HEADER = {
    HEADER_TOTAL: "Total",
    HEADER_OFFSET: "Offset",
    HEADER_LIMIT: "Limit",
};

export const JWT_WEB_TOKEN = {
    DEFAULT_ISSUER: "iCondo",
    DEFAULT_CLIENT: "simulator",
    DEFAULT_EXPIRE: 365 * 2 * 24 * 60 * 60 * 1000, // 2 years,
    RESET_PASSWORD_TIME_EXPIRED: 60 * 60 * 1000, // 60 minutes
    PIN_TIME_EXPIRED: 5 * 60 * 1000, // 60 minutes
};

export const HEADERS = {
    AUTHORIZATION: "authorization",
    USER_AGENT: "user-agent",
    DEVICE_ID: "device-id",
    REGISTRAR_ID: "registrar-id",
    DEVICE_OS: "device-os",
    DEVICE_NAME: "device-name",
    DEVICE_MODEL: "device-model",
    OS_VERSION: "os-version",
    APP_VERSION: "app-version",
    BUILD_VERSION: "build-version",
    PASSWORD: "password"
};

export const PLATFORM = {
    IOS: "iOS",
    ANDROID: "Android",
    WEB_PORTAL: "web-portal",
    WEB_RESIDENT: "web-resident"
};

export const DELETE_STATUS = {
    YES: true,
    NO: false,
};

export const ENABLE_STATUS = {
    YES: true,
    NO: false,
};

export const PASSWORD_LENGTH = 6;

export const PROPERTIES = {
    MOBILE_USER_AGENT: "mobile",
    HEADER_TOTAL: "Total",
    HEADER_OFFSET: "Offset",
    HEADER_LIMIT: "Limit",
    COLUMN_TOTAL_ITEMS: "total"
};

export const ROLE = {
    SYSTEM_ADMIN: "system_admin",
    MANAGER: "manager",
    SALES_EXECUTIVE: "sales_executive",
    CONDO_MANAGER: "condo_manager",
    OWNER: "owner",
    TENANT: "tenant",
    USER: "user",
    CONDO_SECURITY: "condo_security"
};

export const STATUS_USER = {
    NEED_CONDO: "NeedCondo",
    WAITING_APPROVE: "WaitingApprove",
    APPROVE: "Approve",
};

export const STATUS_REQUEST_USER = {
    NEW: "New",
    APPROVE: "Approve",
    REJECT: "Reject",
    ARCHIVED: "Archived"
};

export const IMAGE_TYPE = {
    AVATAR: "avatar"
};

export const LATEST_TRANSACTION_TYPE = {
    SALE: "Sale",
    RENT: "Rent",
};

export const GARAGE_SALE_TYPE = {
    SALE: "Sale",
    RENT: "Rent",
};

export const ONLINE_FORM = {
    ACCESS_CARD: "AccessCard",
    CAR_LABEL: "CarLabel",
    TRANSPONDER: "Transponder",
    IU_REGISTRATION: "IURegistration",
    BICYCLE_TAG: "BicycleTag",
};

export const ONLINE_FORM_SUB_CATEGORY = {
    NO_TYPE: "NoType",
    NEW_CARD: "NewCard",
    LOST_CARD: "LostCard",
    FAULTY_CARD: "FaultyCard",
    CAR_LABEL_FIRST_CAR: "CarLabelFirstCar",
    CAR_LABEL_SECOND_CAR: "CarLabelSecondCar",
    CAR_LABEL_THIRD_CAR: "CarLabelThirdCar",
    CAR_LABEL_TEMPORARY: "CarLabelTemporary",
    CAR_LABEL_LOST_DAMAGE: "CarLabelLostDamage",
    IU_REGISTRATION_FIRST_CAR: "IuRegistrationFirstCar",
    IU_REGISTRATION_SECOND_CAR: "IuRegistrationSecondCar",
    IU_REGISTRATION_THIRD_CAR: "IuRegistrationThirdCar",
    IU_REGISTRATION_TEMPORARY: "IuRegistrationTemporary",
    TRANSPONDER_FIRST_CAR: "TransponderFirstCar",
    TRANSPONDER_SECOND_CAR: "TransponderSecondCar",
    TRANSPONDER_THIRD_CAR: "TransponderThirdCar",
    TRANSPONDER_LOST_DAMAGE: "TransponderLostDamage"
};

export const SORT_FIELDS = {
    FEEDBACK: {
        DATE_RECEIVED: "dateReceived",
        CATEGORY_NAME: "category"
    },
    COUNCIL_MINUTES: {
        DATE_POST: "datePost",
        TITLE: "title"
    },
    CONDO_RULE: {
        DATE_POST: "datePost",
        TITLE: "title"
    },
    UNIT_LOGS: {
        BLOCK: "block"
    }
};

/**
 * All variable defined for advertising template.
 *
 */
export const ADVERTISING_TEMPLATE_TYPE = {
    USEFUL_CONTACTS: "UsefulContacts",
    PREMIUM_TEMPLATE: "Premium",
    STANDARD_TEMPLATE: "Standard",
    SPONSOR_AD_TEMPLATE: "SponsorAd"
};

/**
 * Defined for facilities type.
 */
export const FACILITIES_TYPE = {
    BBQ: "BBQ",
    FUNCTION_ROOM: "FunctionRoom",
    READING_ROOM: "ReadingRoom",
    SQUASH: "Squash",
    TENNIS: "Tennis"
};

/**
 * Define frequency restriction type, support for check rule booking the facilities.
 */
export const FREQUENCY_RESTRICTION_TYPE = {
    DAY: "Day",
    WEEK: "Week",
    MONTH: "Month"
};

/**
 * Frequency restriction type support for booking facilities.
 */
export const FREQUENCY_RESTRICTION_TYPE_ITEM = {
    ONE_DAY: "OneDay",
    ONE_WEEK: "OneWeek",
    TWO_WEEKS: "TwoWeeks",
    THREE_WEEKS: "ThreeWeeks",
    ONE_MONTH: "OneMonth",
    ONE_YEAR: "OneYear"
};

/**
 * Slot restriction support for booking facilities.
 */
export const SLOT_RESTRICTION = {
    LEVEL_CONDO: "condo",
    LEVEL_FLOOR: "floor",
    LEVEL_BLOCK: "block",
    LEVEL_UNIT: "unit",
    LEVEL_STACK: "stack",
    LEVEL_USER: "user"
};

/**
 * Define all slot type available in system.
 */
export const SLOT_TYPE = {
    NORMAL_HOURS: "normal_hours",
    PEAK: "peak"
};

/**
 * Define slot time type:
 * SLOT_TYPE:
 *      | SLOT_TIME_TYPE
 *
 * Example:
 * 1. normal_hours:
 *      | normal_hours
 * 2. peak:
 *      | peak
 *      | off_peak
 */
export const SLOT_TIME_TYPE = {
    NORMAL_HOURS: "normal_hours",
    PEAK: "peak",
    OFF_PEAK: "off_peak",
    TOTAL: "total"
};

/**
 * Slot items default for system:
 * - Normal Hours.
 * - 2 (Peak 1 & 2)
 * - 2 (Off-Peak 1 & 2)
 */
export const SLOT_TIME_ITEM = {
    ITEM_NORMAL_HOURS: "item_normal_hours",
    ITEM_PEAK_1: "item_peak_1",
    ITEM_PEAK_2: "item_peak_2",
    ITEM_OFF_PEAK_1: "item_off_peak_1",
    ITEM_OFF_PEAK_2: "item_off_peak_2"
};

/**
 * Define all slot duration type support in system.
 */
export const SLOT_DURATION_TYPE = {
    HOURLY: "hourly",
    HALF_HOURLY: "half_hourly",
    CUSTOM: "custom"
};

/**
 * Define all booking status support for display and tracking the booking status on mobiles, CM.
 */
export const BOOKING_STATUS = {
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    AWAITING_PAYMENT: "awaiting payment"
};

/**
 * Define payment status support for booking.
 */
export const PAYMENT_STATUS = {
    NEW: "New",
    NOT_APPLICABLE: "N/A",
    ACQUIRED: "Acquired", // removed
    PAID: "Paid",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded", // not used yet
    PENDING: "Pending", // not used yet
};

/**
 * Define payment status support for booking.
 */
export const ONLINE_FORM_STATUS = {
    NEW: "New",
    NOT_APPLICABLE: "N/A",
    ACQUIRED: "Acquired",
    PAID: "Paid",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    PENDING: "Pending",
    REJECTED: "Rejected",
    APPROVED: "Approved",
    RESOLVED: "Resolved"
};

/**
 * Define payment status support for booking.
 */
export const ONLINE_FORM_REQUEST_ITEM_STATUS = {
    NEW: "New",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    RESOLVED: "Resolved",
    ARCHIVED: "Archived",
    ACTIVE: "Active"
};

/**
 * Define all deposit status for booking.
 */
export const DEPOSIT_STATUS = {
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    FORFEITED: "Forfeited",
    PENDING: "Pending",
    DUE: "Due",
    NOT_APPLICABLE: "N/A"
};

/**
 * Define item type support for transaction history.
 * a. Online Form
 * b. Booking Facilities.
 */
export const TRANSACTION_ITEM_TYPE = {
    ONLINE_FORM: "OnlineForm",
    BOOK_FACILITY: "BookFacility"
};

/**
 * TODO: Must be changed in the future.
 * All message will be defined and will be moved to another class in the future.
 */
export const MESSAGE_INFO = {
    MI_TITLE_MESSAGE: "message",
    MI_CREATE_SUCCESSFUL: "create successful.",
    MI_CREATE_UNSUCCESSFUL: "create unsuccessful.",
    MI_UPDATE_SUCCESSFUL: "update successful.",
    MI_UPDATE_UNSUCCESSFUL: "update unsuccessful.",
    MI_DELETE_SUCCESSFUL: "delete successful.",
    MI_DELETE_UNSUCCESSFUL: "delete unsuccessful.",
    MI_IMPORT_SUCCESSFUL: "import successful.",
    MI_EXPORT_SUCCESSFUL: "export successful.",
    MI_UPLOAD_SUCCESSFUL: "upload successful.",
    MI_SENT_SUCCESSFUL: "sent successful.",
    MI_CHANGE_PW_SUCCESSFUL: "change password successful.",
    MI_SEND_PIN_SUCCESSFUL: "send pin successful.",
    MI_SEND_PIN_UN_SUCCESSFUL: "send pin unsuccessful.",
    MI_PHONE_INVALID: "phone number invalid",
    MI_APPLY_PIN_SUCCESSFUL: "apply pin successful.",
    MI_RESET_PIN_SUCCESSFUL: "reset pin successful.",
    MI_SEND_MAIL_CONTACT_US_SUCCESSFUL: "send contact us successful.",
    MI_APPLY_VERIFY_PHONE_CODE_SUCCESSFUL: "verify phone successful.",
    MI_RESET_VERIFY_PHONE_CODE_SUCCESSFUL: "reset verify phone code successful.",
    MI_ASSIGN_USER_SUCCESSFUL: "assign user successful.",
    MI_RESET_PASSWORD_EXPIRED: "your reset token was expired.",
    MI_CHECK_EMAIL_FOR_NEW_PASSWORD: "check your email for new password.",
    MI_CHECK_PHONE_FOR_GET_VERIFY_CODE: "check your phone to get verify code.",
    MI_RESET_PASSWORD_TOKEN_INVALID: "your token is invalid.",
    MI_CREATE_ORDER_SUCCESSFUL: "your order has created successful.",
    MI_RESET_PASSWORD_SUCCESSFUL: "we will send an email to your primary email user_address that you can use to reset your password.",
    MI_SMS_SEND_ACCESS_CODE: "your iCondo verification code is:",
    MI_SMS_RESEND_ACCESS_CODE: "your iCondo new verification code is:",
    MI_SMS_SEND_VERIFY_PHONE_CODE: "your verify phone code is:",
    MI_SMS_RESEND_VERIFY_PHONE_CODE: "your new verify phone code is:",
    MI_CREATE_PAYMENT_SUCCESSFUL: "your payment has been completed",
    MI_REJECT_SUCCESSFUL: "reject request unit successful.",
    MI_REJECT_UN_SUCCESSFUL: "reject request unit unsuccessful.",
    MI_CANCEL_UNIT_SUCCESSFUL: "cancel unit successful.",
    MI_CANCEL_UNIT_UN_SUCCESSFUL: "cancel unit unsuccessful.",
    MI_BULK: (totalSuccess, totalFail, failIndex?): string => {
        if (failIndex) {
            return `${totalSuccess} success. ${totalFail} fail at line ${failIndex}`;
        }
        return `${totalSuccess} success. ${totalFail} fail`;
    },
    MI_REMARK_HAS_MASTER: (roleId): string => {
        return `Unit has an existing master ${roleId}`;
    },
    MI_LIKE_SUCCESSFUL: "like successful.",
    MI_UNLIKE_SUCCESSFUL: "unlike successful.",
};

/**
 *
 * @type {{CHATTERBOX: string; FIND_A_BUDDY: string; SPONSOR_AD: string}}
 */
export const FEED_TYPE = {
    ALL: "all",
    CHATTER_BOX: "Chatterbox",
    FIND_A_BUDDY: "FindABuddy",
    SPONSOR_ADS: "SponsorAds",
    GARAGE_SALE: "GarageSale"
};

export const STATUS_CONTRACT = {
    LIVE: "live",
    ARCHIVED: "archived"
};

export const STATUS_MOVING = {
    LIVE: "live",
    ARCHIVED: "archived"
};

export const CLUSTERING_TYPE = {
    ALL: "all",
    CHATTER_BOX: FEED_TYPE.CHATTER_BOX,
    GARAGE_SALE: FEED_TYPE.GARAGE_SALE,
    FIND_A_BUDDY: FEED_TYPE.FIND_A_BUDDY,
};

export const BAN_USER_TYPE = {
    CHATTERBOX: "Chatterbox",
    FIND_A_BUDDY: "FindABuddy",
    GARAGE_SALE: "GarageSale"
};

export const PIN_CONFIG = {
    NUMBER_OF_CHARACTER: 4,
    COUNT_LIMIT: 3,
    EXPIRY_TIME: 5 * 60, // 5 minutes
    CM_EXPIRY_TIME: 1 * 60 // 1 minute
};

export const PUSH_NOTIFICATION_OPTIONS = {
    DEFAULT_TITLE: "Attention",
    DEFAULT_MESSAGE: "You have new message",
    DEFAULT_COLLAPSE_KEY: "default",
    DEFAULT_ICON: "ic_launcher",
    DEFAULT_EXPIRE: 2419200, // 4 weeks
    DEFAULT_SOUND: "default",
    PRIORITY: {
        HIGH: {
            VALUE: "high",
            ANDROID: "high",
            IOS: 10,
        },
        NORMAL: {
            VALUE: "normal",
            ANDROID: "normal",
            IOS: 5,
        },
    }
};

export const DEVICE_OS = {
    iOS: "iOS",
    ANDROID: "Android"
};

export const PUSH_NOTIFICATION_TYPE = {
    SYSTEM: {
        TYPE: 0,
        TITLE: MESSAGE_INFO.MI_TITLE_MESSAGE,
        CLICK_ACTION: "",
        MESSAGE: ""
    },
    WELCOME_CONDO: {
        TYPE: 1,
        TITLE: "Welcome to iCondo !",
        CLICK_ACTION: "nav_home_screen",
        MESSAGE: "Connect, Interact and meet your neighbours !"
    },
    LATEST_TRANSACTION: {
        TYPE: 2,
        TITLE: "Latest {0} transactions",
        CLICK_ACTION: "nav_my_condo",
        MESSAGE: "Sale Price {0}, Rental Price {1}\nClick for more"
    },
    WHAT_ON_NEW_POST: {
        TYPE: 3,
        TITLE: "New Event",
        CLICK_ACTION: "",
        MESSAGE: ""
    },
    ANNOUNCEMENT_NEW_POST: {
        TYPE: 4,
        TITLE: "New Announcement",
        CLICK_ACTION: "",
        MESSAGE: ""
    },
    REPLY_CHAT_FEEDBACK: {
        TYPE: 5,
        TITLE: "",
        CLICK_ACTION: "nav_feedback",
        MESSAGE: ""
    },
    PAYMENT_REMINDER: {
        // TODO: Cronjon will scan and notify
        TYPE: 6,
        TITLE: "Payment Reminder",
        CLICK_ACTION: "",
        MESSAGE: "Please make payment for your {0} booking\nHave a nice day!"
    },
    EVENT_REMINDER_24_HOURS_BEFORE_BOOKING_EVENT: {
        // TODO: Cronjon will scan and notify
        TYPE: 7,
        TITLE: "Event Reminder",
        CLICK_ACTION: "",
        MESSAGE: "You have booked the {0} {1} for tomorrow @ {2} to {3}\nHave Fun!"
    },
    EVENT_REMINDER_1_HOUR_BEFORE_BOOKING_EVENT: {
        // TODO: Cronjon will scan and notify
        TYPE: 8,
        TITLE: "Event Reminder",
        CLICK_ACTION: "",
        MESSAGE: "Your {0} {1} booking starts in an hour's time\nHave Fun!"
    },
    GARAGE_SALE_NEW_POST: {
        TYPE: 9,
        TITLE: "Garage Sale",
        CLICK_ACTION: "nav_garage_sale_detail",
        MESSAGE: "{0} posted \"{1}\" for {2}",
    },
    GARAGE_SALE_NEW_CHAT_MESSAGE: {
        // TODO: move to Firebase.
        TYPE: 10,
        TITLE: "",
        CLICK_ACTION: "",
        MESSAGE: ""
    },
    GARAGE_SALE_LIKE: {
        TYPE: 11,
        TITLE: "Garage Sale",
        CLICK_ACTION: "nav_garage_sale_detail",
        MESSAGE: "{0} loves \"{1}\""
    },
    FIND_A_BUDDY_NEW_POST: {
        TYPE: 12,
        TITLE: "Find a Buddy",
        CLICK_ACTION: "nav_find_a_buddy",
        MESSAGE: "{0} posted \"{1}\""
    },
    FIND_A_BUDDY_NEW_CHAT_MESSAGE: {
        // TODO: move to Firebase.
        TYPE: 13,
        TITLE: "",
        CLICK_ACTION: "",
        MESSAGE: ""
    },
    FIND_A_BUDDY_LIKE: {
        TYPE: 14,
        TITLE: "Find a Buddy",
        CLICK_ACTION: "nav_find_a_buddy",
        MESSAGE: "{0} loves \"{1}\""
    },
    CHATTERBOX_USER_COMMENT_ON_YOUR_POST: {
        TYPE: 15,
        TITLE: "Chatterbox",
        CLICK_ACTION: "nav_chatterbox_detail",
        MESSAGE: "{0} commented on your post"
    },
    CHATTERBOX_OTHER_USER_COMMENT: {
        TYPE: 16,
        TITLE: "Chatterbox",
        CLICK_ACTION: "nav_chatterbox_detail",
        MESSAGE: "{0} also commented"
    },
    CHATTERBOX_LIKE: {
        TYPE: 17,
        TITLE: "Chatterbox",
        CLICK_ACTION: "nav_chatterbox_detail",
        MESSAGE: "{0} loves your Chatterbox Post"
    },
    CHATTERBOX_LIKE_COMMENT: {
        TYPE: 18,
        TITLE: "Chatterbox",
        CLICK_ACTION: "nav_chatterbox_detail",
        MESSAGE: "{0} loves your comment"
    },
    CHATTERBOX_NEW_POST: {
        TYPE: 19,
        TITLE: "Chatterbox",
        CLICK_ACTION: "nav_chatterbox_detail",
        MESSAGE: "{0} posted a new topic in chatterbox"
    },
    FEEDBACK_RESOLVED: {
        TYPE: 20,
        TITLE: "Feedback resolved",
        CLICK_ACTION: "nav_feedback_detail",
        MESSAGE: ""
    },
    FEEDBACK_REOPEN: {
        TYPE: 21,
        TITLE: "Feedback re-opened",
        CLICK_ACTION: "nav_feedback_detail",
        MESSAGE: ""
    },
    NEW_FEEDBACK_REPLY: {
        TYPE: 22,
        TITLE: "New feedback reply",
        CLICK_ACTION: "nav_feedback_detail",
        MESSAGE: ""
    },
    GROUP_MY_CONDO: [1, 2, 3, 4, 6, 7, 8],
    GROUP_SOCIAL: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    MY_CONDO: "my condo",
    SOCIAL: "social"
};

export const CURRENCY = {
    SINGAPORE: "sgd"
};

export const PAYMENT_GATEWAY = {
    BRAINTREE: "braintree",
    STRIPE: "stripe"
};

export const USER_SETTING_PUSH_TYPE = {
    CHATTERBOX: "Chatterbox",
    FIND_A_BUDDY: "FindABuddy",
    CHAT: "Chat",
    GARAGE_SALE: "GarageSale",
    LOVE: "Love"
};

export const EMAIL_TEMPLATE = {
    WELCOME_TO_CONDO: "1a_welcome_to_icondo",
    OWNER_APPLICATION_TO_CONDO_RECEIVED: "1b_owner_application_to_condo_received",
    NEW_USER_APPLICATION_RECEIVED_OWNER: "1c_new_user_application_received_owner",
    TENTANT_APPLICATION_TO_CONDO_RECEIVED: "1d_tenant_application_to_condo_received",
    NEW_USER_APPLICATION_RECEIVED_TENANT: "1e_new_user_application_received_tenant",
    CONDO_MANAGER_APPROVE: "1f_icondo_condo_manager_approves",
    APPLICATION_HAS_BEEN_REJECTED: "1g_application_has_been_rejected",
    RESET_PASSWORD: "1h_reset_password",
    NEW_PASSWORD: "1k_new_password",
    HOUSING_LOAN_REQUEST_RECEIVED: "2a_housing_loan_request_received",
    NEW_HOUSING_LOAN_REQUEST: "2b_new_housing_loan_request",
    FEEDBACK_RECEIVED_EMAIL_TO_CONDO_MAMAGER: "2c_feedback_received_email_to_condo_manager",
    FEEDBACK_RECEIVED_EMAIL_TO_USER: "2d_feedback_received_email_to_user",
    ONLINE_FORM_ACCESS_CARD_APPROVED: "2e_online_form_access_card_approved",
    ONLINE_FORM_ACCESS_CARD_RECEIVED_TO_CONDO_MANAGER: "2f_online_form_access_card_received_to_condo_manager",
    ONLINE_FORM_CAR_LABEL_APPROVED: "2g_online_form_car_label_approved",
    ONLINE_FORM_CAR_LABEL_RECEIVED_TO_CONDO_MANAGER: "2h_online_form_car_label_received_to_condo_manager",
    ONLINE_FORM_CAR_TRANSPONDER_APPROVED: "2i_online_form_car_transponder_approved",
    ONLINE_FORM_CAR_TRANSPONDER_RECEIVED_TO_CONDO_MANAGER: "2j_online_form_car_transponder_received_to_condo_manager",
    ONLINE_FORM_CAR_IU_REGISTRATION_APPROVED: "2k_online_form_car_iu_registration_approved",
    ONLINE_FORM_CAR_IU_REGISTRATION_RECEIVED_TO_CONDO_MANAGER: "2l_online_form_car_iu_registration_received_to_condo_manager",
    ONLINE_FORM_BICYCLE_TAG_APPROVED: "2m_online_form_bicycle_tag_approved",
    ONLINE_FORM_BICYCLE_TAG_RECEIVED_TO_CONDO_MANAGER: "2n_online_form_bicycle_tag_received_to_condo_manager",
    ONLINE_FORM_RECEIVED_PAYMENT_OFF: "2p_online_form_received_payment_off",
    ONLINE_FORM_RECEIVED_PAYMENT_ON: "2q_online_form_received_payment_on",
    FEEDBACK_RESOLVED_TO_USER: "2o_feedback_resolved_email_to_user",
    ONLINE_FORM_REJECTED: "2z_online_form_rejected",
    FACILITY_BOOKING_PAYMENT_ON: "3a_3c_facility_booking_payment_on",
    FACILITY_BOOKING_PENDING_PAYMENT_SYSTEM: "3b_facility_booking_pending_payment_system_off",
    FACILITY_BOOKING_NO_PAYMENT_NEEDED: "3d_facility_booking_no_payment_needed",
    FACILITY_BOOKING_CANCELLED: "3e_facility_booking_cancelled",
    FACILITY_BOOKING_CANCELLED_PAY_BY_CASH: "3e_facility_booking_cancelled_pay_by_cash",
    FACILITY_BOOKING_DEPOSIT_FORFEITED: "3f_facilities_booking_deposit_forfeited",
    FACILITY_BOOKING_DEPOSIT_RETURNED: "3g_facilities_booking_deposit_returned",
    SELL_MY_CAR_REQUEST: "7a_sell_my_car_request_received",
    SELL_MY_CAR_REQUEST_EMAIL_TO_CONDO_MANAGER: "7b_sell_my_car_request_email_to_icondo_backend",
    CAR_INSURANCE_QUOTATION_REQUEST_SEND_TO_USER: "7c_car_insurance_quotation_request_send_to_user",
    CAR_INSURANCE_QUOTATION_REQUEST_SEND_TO_ICONDO_MANAGER: "7d_car_insurance_request_send_to_icondo",
    GET_QUOTATION: "111_get_quotation",
    SEND_CUSTOM_EMAIL_BY_MANAGER: "send_custom_email_by_manager",
    SEND_CUSTOM_EMAIL: "send_custom_email",
    NEW_CONDO_REQUEST: "new_condo_request",
    TENANCY_EXPIRY_REMINDER: "send_tenancy_expiry_reminder",
};

export const MOMENT_DATE_FORMAT = {
    YYYY_MM_DD: "YYYY-MM-DD",
    DD_MMM_YY: "DD MMM YY",
    DD_MMM_YY_H_m: "DD MMM YY HH:mm",
    MM_DD_YYYY: "MM-DD-YYYY",
    DD_MM_YYYY: "DD-MM-YYYY",
    YYYY_MM_DD_H_m: "YYYY-MM-DD HH:mm",
    MM_DD_YYYY_H_m: "MM-DD-YYYY HH:m",
    DD_MM_YYYY_H_m: "DD-MM-YYYY HH:mm",
    DD_MMMM_YYYY_hh_mm_A: "DD MMMM YYYY, hh:mm A",
    HH_MM: "HH:mm",
    HH_MM_A: "hh:mm a",
    SEND_MAIL_FULL_DATE: "dddd, DD MMM YYYY",
    MMM_YY: "MMM YY",
    SEND_MAIL_FULL_DATE_TIME: "hh:mm a, dddd, DD MMM YYYY"
};

export const INBOX_TYPE = {
    FOR_SALE: GARAGE_SALE_TYPE.SALE,
    FOR_RENT: GARAGE_SALE_TYPE.RENT,
    FIND_A_BUDDY: FEED_TYPE.FIND_A_BUDDY,
    FEEDBACK: "Feedback",
    UNIT_LOG: "UnitLog",
};

export const MAX_SELL_MY_CAR = 5;

export const RATING_TEMPLATE = {
    RATE: 5,
    NUMBER: 20
};

export const SMS_TYPE = {
    OTP: "otp",
    GET_QUOTATION: "get_quotation",
    UNIT_LOG: "unit_log"
};

export const REPORT_KEY = {
    UNREGISTERED_UNIT: "units unregistered",
    REGISTERED_UNIT: "units registered",
    OWNER: "owners",
    TENANT: "tenants",
    FEEDBACK_RECEIVED: "feedback received",
    FEEDBACK_RESOLVED: "resolved",
    FEEDBACK_PENDING: "pending",
    FEEDBACK_TOTAL_PENDING: "total pending",
};

export const REPORT = {
    CONTRACT_NEXT_MONTH_EXPIRE: 3, // 3 month
    FEEBACK_TREND_PREVIOUS_MONTH: 5, // 5 month
    MONTH_DURATION_TRENDING: 6 // 6 month
};

/**
 * Scheduler config.
 */
export const SCHEDULER_SCRIPT = {
    TRIGGER_NAME: "trigger",
};

export const NOTIFY_TENANT_EXPIRE = {
    TENANT_EXPIRE_PATH: "/trigger/v1/tenant/expire",
};

export const NOTIFY_BOOKING_REMINDER = {
    COUNTER_DEPOSIT: "COUNTER_DEPOSIT",     // Support for CM about the badge number
    REMINDER_DEBUGGING_SECONDS: 10,     // FOR TESTING.
    DAILY_REMINDER: 12,     // Daily Reminder at 12 PM
    EVENT_24H_BEFORE: 24,   // 24 Hours before Booking Event
    EVENT_1H_BEFORE: 1,     // 1 Hour before Booking Event
    PAYMENT_REMINDER_PATH: "/trigger/v1/booking_reminder/reminder"
};

/**
 * firebase - online status: channel or online or offline.
 */
export const FIREBASE_ONLINE_STATUS = {
    ONLINE: "online",
    OFFLINE: "offline"
};

export const DEFAULT_HOUSING_LOAN = {
    YEAR1: "1.00%",
    YEAR2: "1.40%",
    YEAR3: "1.40%",
    YEAR4: "1.65%",
    YEAR_OTHER: "1.65%",
    TERMS: "rate type: floating 48-mth FDR\nlock in period: NIL",
    BONUS: "legal subsidy: $1,800 (loan > $500k)\nIKEA voucher: $200 (loan > $500k)",
    MESSAGE: "We constantly search for the best housing loan package\n\nThis service is provided to you free of charge\n\nBy submitting this request you agree to be contacted by a bank representative for a no obligation quotation"
};

export const NOTIFICATION_SETTING_DESCRIPTION = {
    CHAT: "turn this off if you do not wish to receive chat notifications",
    GARAGE_SALE: "turn this off if you do not wish to receive notifications when other users post new garage sale items",
    CHATTERBOX: "turn this off if you do not wish to receive notifications when other users post comments",
    FIND_A_BUDDY: "turn this off if you do not wish to receive notifications when other users create new find a buddy postings",
    LOVE: "turn this off if you do not wish to receive notifications when other users love your posts, listings or comments"
};

export const EMAIL_SUBJECT = {
    GET_QUOTATION: "iCondo - Request for Quotation"
};

export const FEEDBACK_STATUS = {
    PENDING: "Pending",
    RESOLVED: "Resolved"
};

export const FEEDBACK_REPLY_STATUS = {
    PENDING: "Pending",
    RESOLVED: "Resolved"
};

export const SCHEDULER_EVERY = {
    TENANCY_EXPIRY_REMINDER: "tenancy_expiry_schedule" // do not modify because it is need for remove expiry key in redis
};

export const FUNCTION_PASSWORD_TYPE = {
    // mapping with function password model
    NEW_USER: "newUser",
    DEPOSIT: "deposit",
    ONLINE_FORM: "onlineForm",
    BOOKING: "booking",
    UNIT_LOG: "unitLog",
    FEEDBACK: "feedback"
};

export const ANNOUNCEMENT_STATUS = {
    ACTIVE: "active",
    ARCHIVED: "archived"
};

export const WHAT_ON_STATUS = {
    ACTIVE: "active",
    ARCHIVED: "archived"
};

export const BOOKING_SPECIAL_PRICE_TYPE = {
    SPECIAL_DAY: "Special Day",
    SPECIAL_TIME: "Special Time",
    TIME_TYPE: "Time Type",
    WEEK_DAY: "Week Day"
};

export const BOOKING_SLOT_TIME_TYPE = {
    PEAK: "peak",
    OFF_PEAK: "off_peak",
};

