import { SLOT_TIME_TYPE } from "../../libs/constants";

/**
 * Created by kiettv on 12/26/16.
 */

export const SLOT_SUSPENSION_TABLE_SCHEMA = {
    TABLE_NAME: "slot_suspension",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TARGET_ID: "target_id",
        START_TIME: "start_time",
        END_TIME: "end_time",
        SLOT_ID: "slot_id",
        FACILITY_ID: "facility_id",
        NOTE: "note",
    },
};

export const CLUSTERING_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "clustering_type",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description",
    },
};

export const CLUSTERING_TABLE_SCHEMA = {
    TABLE_NAME: "clustering",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        TYPE: "type",
    },
};

export const CLUSTERING_MEMBERS_TABLE_SCHEMA = {
    TABLE_NAME: "clustering_members",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CLUSTERING_ID: "clustering_id",
        CONDO_ID: "condo_id",
    },
};

export const SLOT_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_types",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description"
    },
};

export const SLOT_TIME_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_time_types",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description"
    },
};

export const SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_time_item_template",
    FIELDS: {
        ID: "id",
        NAME: "name",
        SLOT_TYPE_ID: "slot_type_id",
        SLOT_TIME_TYPE_ID: "slot_time_type_id",
        PRIORITY: "priority",
        IS_ENABLE: "is_enable",
        DESCRIPTION: "description"
    },
};

export const SLOT_DURATION_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_duration_types",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description"
    },
};

export const SLOT_RESTRICTION_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_restriction_types",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description"
    },
};

export const FACILITY_TYPE_TABLE_SCHEMA = {
    TABLE_NAME: "facility_types",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        NAME: "name",
        PRIORITY: "priority",
        DESCRIPTION: "description"
    },
};

export const FACILITIES_TABLE_SCHEMA = {
    TABLE_NAME: "facilities",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        // FACILITY_TYPE_ID: "facility_type_id",
        NAME: "name",
        ICON_URL: "icon_url",
        DESCRIPTION: "description",
        SLOT_TYPE_ID: "slot_type_id",
        DURATION_TYPE: "duration_type",
        PRIORITY: "priority",
        ALLOW_BEFORE_END_TIME: "allow_before_end_time",
        IMAGE_URL: "image_url",
        QUOTA_EXEMPT: "quota_exempt" // Number of seconds before event start to be exempted
    },
};

export const SLOT_TABLE_SCHEMA = {
    TABLE_NAME: "slots",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        FACILITY_ID: "facility_id",
        SLOT_TYPE_ID: "slot_type_id",
        SLOT_RULE_ID: "slot_rule_id",
        DESCRIPTION: "description"
    },
};

export const SLOT_TIME_TABLE_SCHEMA = {
    TABLE_NAME: "slot_times",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        FACILITY_ID: "facility_id",
        SLOT_ID: "slot_id",
        DURATION_TYPE: "duration_type",
        ISO_WEEK_DAY: "iso_week_day"
    },
};

export const SLOT_TIME_ITEM_TABLE_SCHEMA = {
    TABLE_NAME: "slot_time_items",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        SLOT_TIME_ID: "slot_time_id",
        ITEM_NAME_ID: "item_name_id",   // Reference to SLOT_TIME_ITEM_TEMPLATE_TABLE.
        SLOT_TYPE_ID: "slot_type_id",
        SLOT_TIME_TYPE_ID: "slot_time_type_id",
        START_TIME: "start_time",
        END_TIME: "end_time"
    },
};

export const SLOT_DURATION_TABLE_SCHEMA = {
    TABLE_NAME: "slot_duration",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        FACILITY_ID: "facility_id",
        SLOT_TIME_ID: "slot_time_id",
        SLOT_TYPE_ID: "slot_type_id",
        SLOT_TIME_TYPE_ID: "slot_time_type_id",
        START_TIME: "start_time",
        END_TIME: "end_time",
        ISO_WEEK_DAY: "iso_week_day"
    },
};

export const SLOT_RULES_TABLE_SCHEMA = {
    TABLE_NAME: "slot_rules",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        FACILITY_ID: "facility_id",
        SLOT_AVAILABLE_ADVANCE: "slot_available_advance",
        CAN_NOT_CANCEL: "cannot_cancel",
        CANCELLATION_MINUTES: "cancellation_minutes",
        CANCELLATION_HOURS: "cancellation_hours",
        CANCELLATION_DAYS: "cancellation_days",
        PAYMENT_AMOUNT: "payment_amount",
        DEPOSIT_AMOUNT: "deposit_amount",
        TERM_CONDITION_URL: "term_condition_url"
    },
};

export const SLOT_RESTRICTION_TABLE_SCHEMA = {
    TABLE_NAME: "slot_restrictions",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        RESTRICTION_LEVEL: "restriction_level",
        SLOT_TIME_TYPE_ID: "slot_time_type_id",
        FACILITY_ID: "facility_id",

        BOOKING_NO_LIMIT: "booking_no_limit",
        BOOKING_QUANTITY: "booking_quantity",
        BOOKING_RESTRICT_UNIT_ID: "booking_restrict_unit_id",
        ISO_WEEK_DAY: "iso_week_day"
    },
};

export const SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA = {
    TABLE_NAME: "slot_frequency_restriction",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        TYPE: "type",
        CONDITION_INTERVAL: "condition_interval",
        DESCRIPTION: "description"
    }
};

export const MEDIA_TABLE_SCHEMA = {
    TABLE_NAME: "media",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        PATH: "path",
        URL: "url",
        HASH: "hash",
    },
};

export const SESSION_TABLE_SCHEMA = {
    TABLE_NAME: "sessions",
    FIELDS: {
        ID: "id",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        USER_ID: "user_id",
        TOKEN: "token",
        EXPIRE: "expire",
        HASH: "hash",
        PLATFORM: "platform",
    },
};

export const ROLE_TABLE_SCHEMA = {
    TABLE_NAME: "roles",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        DESCRIPTION: "description",
    },
};

export const VARIABLE_TABLE_SCHEMA = {
    TABLE_NAME: "settings",
    FIELDS: {
        ID: "id",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        KEY: "key",
        VALUE: "value",
        DESC: "description",
    },
};

export const DEVICE_TABLE_SCHEMA = {
    TABLE_NAME: "devices",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        DEVICE_ID: "device_id",
        REGISTRAR_ID: "registrar_id",
        DEVICE_OS: "device_os",
        DEVICE_MODEL: "device_model",
        DEVICE_NAME: "device_name",
        OS_VERSION: "os_version",
        APP_VERSION: "app_version",
        BUILD_VERSION: "build_version",
        IS_SANDBOX: "is_sandbox",
    },
};

export const PHONE_NUMBER_TABLE_SCHEMA = {
    TABLE_NAME: "phone_number",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        PHONE_NUMBER: "phone_number",
        VERIFICATION_CODE: "verification_code",
        EXPIRE: "expire",
        IS_VERIFY: "is_verify",
    },
};

export const USER_TABLE_SCHEMA = {
    TABLE_NAME: "users",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ROLE_ID: "role_id",
        EMAIL: "email",
        PASSWORD: "password",
        FIRST_NAME: "first_name",
        LAST_NAME: "last_name",
        AVATAR_URL: "avatar_url",
        PHONE_NUMBER: "phone_number",
        STATUS: "status",
        CUSTOMER_ID: "customer_id", // customer_id use for brain tree
        AGENT: "agent",
        CUSTOME_USER_ROLE: "custom_user_role",
        EMAIL_CONTACT: "email_contact",
        CONTACT_NUMBER: "contact_number"
    },
};

export const USER_UNIT_TABLE_SCHEMA = {
    TABLE_NAME: "user_unit",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        UNIT_ID: "unit_id",
        CONDO_ID: "condo_id",
        ROLE_ID: "role_id",
        REMARKS: "remarks",
        PROOF_URL: "proof_url",
        IS_MASTER: "is_master",
        IS_RESIDENT: "is_resident",
        TENANCY_EXPIRY: "tenancy_expiry",
        STATUS: "status",
        HAD_EXPIRED_REMINDER: "had_expired_reminder"
    },
};

export const USER_MANAGER_TABLE_SCHEMA = {
    TABLE_NAME: "user_manager",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
    },
};

export const UNIT_TABLE_SCHEMA = {
    TABLE_NAME: "unit",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        STACK_NUMBER: "stack_number",
        UNIT_NUMER: "unit_numer",
        UNIT_NUMBER: "unit_number",
        FLOOR_ID: "floor_id",
    },
};

export const FLOOR_TABLE_SCHEMA = {
    TABLE_NAME: "floor",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        FLOOR_NUMBER: "floor_number",
        BLOCK_ID: "block_id",
    },
};

export const BLOCK_TABLE_SCHEMA = {
    TABLE_NAME: "block",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        BLOCK_NUMBER: "block_number",
        CONDO_ID: "condo_id",
    },
};

export const CONDO_TABLE_SCHEMA = {
    TABLE_NAME: "condo",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        MCST_NUMBER: "mcst_number",
        ADDRESS1: "address1",
        ADDRESS2: "address2",
        OFFICE_PHONE1: "office_phone1",
        OFFICE_PHONE2: "office_phone2",
        SECURITY_OFFICE_PHONE: "security_office_phone",
        EMAIL: "email",
        IMAGE_URL: "image_url",
        LATITUDE: "latitude",
        LONGITUDE: "longitude",
        COUNTRY: "country",
        POST_CODE: "post_code",
        BRAINTREE_MERCHANTID: "braintree_merchantid",
        BRAINTREE_PUBLICKEY: "braintree_publickey",
        BRAINTREE_PRIVATEKEY: "braintree_privatekey",
        GENERAL_EMAIL: "general_email",
        NEW_USER_NOTIFICATION_EMAIL: "new_user_notification_email",
        ONLINE_FORM_NOTIFICATION_EMAIL: "online_form_notification_email",
        FEEDBACK_NOTIFICATION_EMAIL: "feedback_notification_email",
        PAY_BY_CASH: "pay_by_cash",
        TIMEZONE: "timezone",
        BOOKING_NOTIFICATION_EMAIL: "booking_notification_email"
    },
};

export const ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_category_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
    },
};

export const ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_sub_category_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        ONLINE_FORM_CATEGORY_TEMPLATE_ID: "online_form_category_template_id",
        PRIORITY: "priority"
    },
};

export const ONLINE_FORM_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        NAME: "name",
        TC_URL: "tc_url",
        ONLINE_FORM_CATEGORY_TEMPLATE_ID: "online_form_category_template_id"
    },
};

export const ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_sub_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        NAME: "name",
        ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID: "online_form_sub_category_template_id",
        ONLINE_FORM_CATEGORY_ID: "online_form_category_id",
    },
};

export const ONLINE_FORM_FEE_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_fee",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ONLINE_FORM_SUB_CATEGORY_ID: "online_form_sub_category_id",
        PRICE: "price"
    },
};

export const ONLINE_FORM_TABLE_SCHEMA = {
    TABLE_NAME: "online_form",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        NAME: "name",
        PRICE: "price",
        COUNT_OF_REQUEST: "count_of_request",
        TC_URL: "tc_url",
        PRIORITY: "priority",
        ONLINE_FORM_CATEGORY_ID: "online_form_category_id",
    }
};

export const ONLINE_FORM_REQUEST_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_request",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ONLINE_FORM_ID: "online_form_id",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        UNIT_ID: "unit_id",
        PRICE: "price",
        TOTAL: "total",
        NUMBER_OF_ITEMS: "number_of_items",
        VEHICLE_NUMBER: "vehicle_number",
        IU_NUMBER: "iu_number",
        PROOF_OF_CAR: "proof_of_car",
        USER_HANDLER_ID: "user_handler_id",
        TRANSACTION_ID: "transaction_id",
        STATUS: "status",
        PAY_BY_CASH: "pay_by_cash",
        ONLINE_FORM_SUB_CATEGORY_ID: "online_form_sub_category_id"
    },
};

export const ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA = {
    TABLE_NAME: "online_form_request_items",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ONLINE_FORM_REQUEST_ID: "online_form_request_id",
        REMARKS: "remarks",
        SERIAL_NUMBER: "serial_number",
        TRANSACTION_ID: "transaction_id",
        STATUS: "status",
        USER_ID: "user_id", // New update
        CONDO_ID: "condo_id",
        UNIT_ID: "unit_id",
        PRICE: "price",
        VEHICLE_NUMBER: "vehicle_number",
        IU_NUMBER: "iu_number",
        PROOF_OF_CAR: "proof_of_car", // become proof_of_ownership_photo
        PROOF_OF_OWNERSHIP_PHOTO: "proof_of_ownership_photo",
        PAY_BY_CASH: "pay_by_cash",
        ONLINE_FORM_SUB_CATEGORY_ID: "online_form_sub_category_id"
    },
};

export const LATEST_TRANSACTION_TABLE_SCHEMA = {
    TABLE_NAME: "latest_transaction",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        TRANSACTION_DATE: "transaction_date",
        BLOCK: "block",
        UNIT_NUMBER: "unit_number",
        SIZE: "size",
        PRICE: "price",
        PSF: "psf",
        TYPE: "type",
    },
};

export const HOUSING_LOAN_TABLE_SCHEMA = {
    TABLE_NAME: "housing_loan",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        YR1: "yr1",
        YR2: "yr2",
        YR3: "yr3",
        YR4: "yr4",
        YR_OTHER: "yr_other",
        RATE_TYPE: "rate_type",
        LOCK_IN_PERIOD: "lock_in_period",
        LEGAL_SUBSIDY: "legal_subsidy",
        IKEA_VOUCHER: "IKEA_Voucher",
        MESSAGE: "message",
        EMAILS: "emails",
    },
};

// region Feedback

export const FEEDBACK_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "feedback_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        NAME: "name",
        KEYWORD: "keyword", // drop
        EMAIL: "email",
        ORDER_INDEX: "order_index",
    },
};

export const FEEDBACK_CATEGORY_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "feedback_category_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        KEYWORD: "keyword",
        ORDER_INDEX: "order_index",
    },
};

export const FEEDBACK_TABLE_SCHEMA = {
    TABLE_NAME: "feedback",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        CONTENT: "content",
        IMAGE_URL: "image_url",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        UNIT_ID: "unit_id",
        FEEDBACK_CATEGORY_ID: "feedback_category_id",
        FEEDBACK_CATEGORY_TEMPLATE_ID: "feedback_category_template_id", // drop
        STATUS: "status",
        DATE_RECEIVED: "date_received",
        DATE_RESOLVED: "date_resolved",
        RESOLVE_BY: "resolve_by",
        NOTE: "note",
        TICKET_NUMBER: "ticket_number"
    },
};

export const FEEDBACK_REPLY_TABLE_SCHEMA = {
    TABLE_NAME: "feedback_reply",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONTENT: "content",
        IMAGE_URL: "image_url",
        FEEDBACK_ID: "feedback_id",
        USER_ID: "user_id"
    },
};

// endregion

// region WhatOn
export const WHAT_ON_TABLE_SCHEMA = {
    TABLE_NAME: "what_on",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        TITLE_LIST_VIEW: "title_list_view",
        TITLE_DETAIL: "title_detail",
        DAY: "day",
        DATE: "date",
        TIME: "time",
        VENUE: "venue",
        OPEN_TIME: "open_time",
        SHORT_DESCRIPTION: "short_description",
        DESCRIPTION: "description",
        SIGNATURE: "signature",
        PHONE: "phone",
        IS_PHONE_ENABLE: "is_phone_enable",
        WEBSITE: "website",
        IS_WEBSITE_ENABLE: "is_website_enable",
        FILE: "file",
        IS_FILE_ENABLE: "is_file_enable",
        COVER_PICTURE: "cover_picture",
        CONDO_ID: "condo_id",
        DATE_POST: "date_post",
        EXPIRY_DATE: "expiry_date",
        READING_COUNT: "reading_count",
        IS_ADMIN_CREATE: "is_admin_create",
    },
};

export const WHAT_ON_IMAGE_TABLE_SCHEMA = {
    TABLE_NAME: "what_on_image",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        WHAT_ON_ID: "what_on_id",
        IMAGE_URL: "image_url",
        ORDER_INDEX: "order_index",
    },
};

export const WHAT_ON_VIEW_TABLE_SCHEMA = {
    TABLE_NAME: "what_on_view",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        WHAT_ON_ID: "what_on_id"
    },
};

// endregion

// region ANNOUNCEMENT
export const ANNOUNCEMENT_TABLE_SCHEMA = {
    TABLE_NAME: "announcement",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        TITLE_LIST_VIEW: "title_list_view",
        TITLE_DETAIL: "title_detail",
        DESCRIPTION: "description",
        SIGNATURE: "signature",
        PHONE: "phone",
        IS_PHONE_ENABLE: "is_phone_enable",
        WEBSITE: "website",
        IS_WEBSITE_ENABLE: "is_website_enable",
        FILE: "file",
        IS_FILE_ENABLE: "is_file_enable",
        COVER_PICTURE: "cover_picture",
        CONDO_ID: "condo_id",
        DATE_POST: "date_post",
        EXPIRY_DATE: "expiry_date",
        READING_COUNT: "reading_count",
        IS_TARGETED: "is_targeted",
    },
};

export const ANNOUNCEMENT_IMAGE_TABLE_SCHEMA = {
    TABLE_NAME: "announcement_image",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ANNOUNCEMENT_ID: "announcement_id",
        IMAGE_URL: "image_url",
        ORDER_INDEX: "order_index",
    },
};

export const ANNOUNCEMENT_VIEW_TABLE_SCHEMA = {
    TABLE_NAME: "announcement_view",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        ANNOUNCEMENT_ID: "announcement_id"
    },
};

// endregion

export const CONDO_RULES_TABLE_SCHEMA = {
    TABLE_NAME: "condo_rules",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        DOCUMENT: "document",
        LINK: "link",
        DATE_POST: "date_post",
        CONDO_ID: "condo_id",
    },
};

export const COUNCIL_MINUTES_TABLE_SCHEMA = {
    TABLE_NAME: "council_minutes",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        DOCUMENT: "document",
        LINK: "link",
        DATE_POST: "date_post",
        CONDO_ID: "condo_id",
    },
};

export const GARAGE_SALE_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "garage_sale_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        PRIORITY: "priority"
    },
};

export const GARAGE_SALE_TABLE_SCHEMA = {
    TABLE_NAME: "garage_sale",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        TYPE: "type",
        PRICE: "price",
        CONTENT: "content",
        GARAGE_SALE_CATEGORY_ID: "garage_sale_category_id",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        DATE_POST: "date_post",
        IMAGES: "images",
        STATUS: "status", // not use
        MARK_RESOLVED: "mark_resolved",
    },
};

export const GARAGE_SALE_LIKE_TABLE_SCHEMA = {
    TABLE_NAME: "garage_sale_like",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        GARAGE_SALE_ID: "garage_sale_id"
    },
};

export const USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "useful_category_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        ICON_URL: "icon_url",
        DESCRIPTION: "description",
        PRIORITY: "priority"
    }
};

export const USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "useful_sub_category_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CATEGORY_ID: "category_id",
        NAME: "name",
        ICON_URL: "icon_url",
        DESCRIPTION: "description",
        PRIORITY: "priority"
    }
};

export const USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "useful_contacts_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        KEYWORD: "keyword",
        CONDO_ID: "condo_id",
        NAME: "name",
        ICON_URL: "icon_url",
        DESCRIPTION: "description",
        PRIORITY: "priority"
    }
};

export const USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "useful_contacts_sub_category",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CATEGORY_ID: "category_id",
        NAME: "name",
        ICON_URL: "icon_url",
        DESCRIPTION: "description",
        PRIORITY: "priority"
    }
};

export const PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA = {
    TABLE_NAME: "payment_status_categories",
    FIELDS: {
        ID: "id",
        DESCRIPTION: "description"
    },
};

export const BOOKING_ITEM_TABLE_SCHEMA = {
    TABLE_NAME: "booking_items",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        BOOKING_ID: "booking_id",
        EVENT_START_DATE: "event_start_date",
        EVENT_END_DATE: "event_end_date",
        START_TIME: "start_time",
        END_TIME: "end_time",
        PAYMENT_AMOUNT: "payment_amount",
        DEPOSIT_AMOUNT: "deposit_amount",
        FACILITY_ID: "facility_id",
        FACILITY_NAME: "facility_name",
        SLOT_ID: "slot_id",
        SLOT_NAME: "slot_name",
        SLOT_TIME_TYPE_ID: "slot_time_type_id",
    },
};

export const BOOKING_TABLE_SCHEMA = {
    TABLE_NAME: "bookings",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        EVENT_START_DATE: "event_start_date",
        EVENT_END_DATE: "event_end_date",
        RECEIPT_NO: "receipt_no",
        PAYMENT_AMOUNT: "payment_amount",
        DEPOSIT_AMOUNT: "deposit_amount",
        PAYMENT_STATUS: "payment_status",
        DEPOSIT_STATUS: "deposit_status",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        BLOCK_ID: "block_id",
        FLOOR_ID: "floor_id",
        UNIT_ID: "unit_id",
        NOTE: "note",
        PAY_BY_CASH: "pay_by_cash"
    },
};

export const ADVERTISER_TABLE_SCHEMA = {
    TABLE_NAME: "advertiser",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        BUSINESS_NAME: "business_name",
        CONTACT_NAME: "contact_name",
        PHONE_NUMBER: "phone_number",
        MOBILE_NUMBER: "mobile_number",
        EMAIL: "email",
        WEBSITE: "website",
        ADDRESS_LINE_1: "address_line_1",
        ADDRESS_LINE_2: "address_line_2",
        POSTAL_CODE: "postal_code",
        DESCRIPTION: "description"
    }
};

export const ADVERTISING_TEMPLATE_TABLE_SCHEMA = {
    TABLE_NAME: "advertising_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ADVERTISER_ID: "advertiser_id",
        TEMPLATE_NAME: "template_name",
        PROFILE_NAME: "profile_name",
        PROFILE_PICTURE_URL: "profile_picture_url",
        HEADING: "heading",
        SHORT_DESCRIPTION: "short_description",
        SMS: "sms",
        PHONE: "phone",
        HEADING_MAIN_PAGE: "heading_main_page",
        DESCRIPTION: "description",
        SMS_MAIN_PAGE: "sms_main_page",
        PHONE_MAIN_PAGE: "phone_main_page",
        WEBSITE: "website",
        ADDRESS_LINE_1: "address_line_1",
        ADDRESS_LINE_2: "address_line_2",
        POSTAL_CODE: "postal_code",
        OPENING_HOUR: "opening_hour",
        OPENING_HOUR_EXT: "opening_hour_ext",
        OPENING_HOUR_NOTE: "opening_hour_note",
        TEMPLATE_TYPE: "template_type",  // Premium or Standard template or Sponsor ad template.
        IS_SMS_ENABLE: "is_sms_enable",
        IS_PHONE_ENABLE: "is_phone_enable",
        IS_SMS_MAINPAGE_ENABLE: "is_sms_mainpage_enable",
        IS_PHONE_MAINPAGE_ENABLE: "is_phone_mainpage_enable",
        IS_WEBSITE_ENABLE: "is_website_enable",
        IS_LOCATION_ENABLE: "is_location_enable"
    }
};

export const ADVERTISING_IMAGE_TABLE_SCHEMA = {
    TABLE_NAME: "advertising_image",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TEMPLATE_ID: "template_id",
        IMAGE_URL: "image_url",
        IMAGE_NAME: "image_name"
    }
};

export const ADVERTISING_CONDO_TABLE_SCHEMA = {
    TABLE_NAME: "advertising_condo",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ADVERTISER_ID: "advertiser_id",
        CONDO_ID: "condo_id",
        CATEGORY_ID: "category_id",
        SUB_CATEGORY_ID: "sub_category_id",
        TEMPLATE_ID: "template_id",
        FREQUENCY: "frequency",
        EXPIRY_DATE: "expiry_date",
        IS_EXPIRED: "is_expired"
    }
};

export const RATING_ADVERTISING_TEMPLATE_SCHEMA = {
    TABLE_NAME: "rating_advertising_template",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        TEMPLATE_ID: "template_id",
        RATING_VALUE: "rating_value"
    }
};

export const CLUSTERING_CONDO_TABLE_SCHEMA = {
    TABLE_NAME: "clustering_condo",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name",
        LIST_CONDO: "list_condo",
        IS_GARAGE_SALE: "is_garage_sale",
        IS_FIND_BUDDY: "is_find_buddy"
    }
};

export const CHATTERBOX_TABLE_SCHEMA = {
    TABLE_NAME: "chatterbox",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONTENT: "content",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        DATE_POST: "date_post",
        IMAGE_URL: "image_url",
        TAG: "tag",
    },
};

export const CHATTERBOX_LIKE_TABLE_SCHEMA = {
    TABLE_NAME: "chatterbox_like",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        CHATTERBOX_ID: "chatterbox_id",
        COMMENT_ID: "comment_id"
    },
};

export const CHATTERBOX_COMMENT_TABLE_SCHEMA = {
    TABLE_NAME: "chatterbox_comment",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        CHATTERBOX_ID: "chatterbox_id",
        CONTENT: "content",
    },
};

export const CHATTERBOX_COMMENT_LIKE_TABLE_SCHEMA = {
    TABLE_NAME: "chatterbox_comment_like",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        COMMENT_ID: "comment_id"
    },
};

export const FEED_TABLE_SCHEMA = {
    TABLE_NAME: "feeds",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TITLE: "title",
        CONTENT: "content",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        TYPE: "type",
        DATE_POST: "date_post",
        IMAGE_URL: "image_url",
        TAG: "tag",
    },
};

export const FEED_LIKE_TABLE_SCHEMA = {
    TABLE_NAME: "feed_likes",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        FEED_ID: "feed_id",
        TYPE: "type",
        COMMENT_ID: "comment_id"
    },
};

export const FEED_COMMENT_TABLE_SCHEMA = {
    TABLE_NAME: "feed_comments",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        FEED_ID: "feed_id",
        TYPE: "type",
        CONTENT: "content",
    },
};

export const FEED_COMMENT_LIKE_TABLE_SCHEMA = {
    TABLE_NAME: "feed_comment_like",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        FEED_COMMENT_ID: "feed_comment_id"
    },
};

export const TRANSACTION_HISTORY_TABLE_SCHEMA = {
    TABLE_NAME: "transaction_history",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        USER_ID: "user_id",
        TRANSACTION_ID: "transaction_id",
        TRANSACTION_DATE: "transaction_date",
        ITEM_ID: "item_id",
        ITEM_TYPE: "item_type",
        AMOUNT: "amount",
        PAY_BY_CASH: "pay_by_cash",
        ONLINE_FORM_REQUEST_TEMP_ID: "online_form_request_temp_id"
    },
};

export const BRAINTREE_ACCOUNT_TABLE_SCHEMA = {
    TABLE_NAME: "braintree_account",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        MERCHANT_ID: "merchant_id",
        PUBLIC_KEY: "public_key",
        PRIVATE_KEY: "private_key"
    }
};

export const PAYMENT_SOURCE_TABLE_SCHEMA = {
    TABLE_NAME: "payment_source",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CUSTOMER_ID: "customer_id",
        USER_ID: "user_id",
        BRAINTREE_ACCOUNT_ID: "braintree_account_id",
        PAYMENT_GATEWAY_ACCOUNT_ID: "payment_gateway_account_id",
        CONDO_ID: "condo_id"
    }
};

export const CONTRACT_TABLE_SCHEMA = {
    TABLE_NAME: "contract",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        TYPE: "type",
        STATUS: "status",
        START_DATE: "start_date",
        END_DATE: "end_date",
        VENDOR_NAME: "vendor_name",
        AMOUNT: "amount",
        CONTRACT_DOCUMENT: "contract_document",
        TENDER1_DOCUMENT: "tender1_document",
        TENDER2_DOCUMENT: "tender2_document",
        TENDER3_DOCUMENT: "tender3_document",
        TENDER4_DOCUMENT: "tender4_document",
        TENDER5_DOCUMENT: "tender5_document"
    }
};

export const GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA = {
    TABLE_NAME: "get_quotation_subcategory",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name"
    }
};

export const GET_QUOTATION_SERVICE_TABLE_SCHEMA = {
    TABLE_NAME: "get_quotation_service",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ADVERTISER_ID: "advertiser_id",
        SUBCATEGORY_ID: "subcategory_id",
        PHONE_NUMBER: "phone_number",
        MOBILE: "mobile",
        EMAIL: "email",
        EXPIRY_DATE: "expiry_date"
    }
};

export const MOVING_TABLE_SCHEMA = {
    TABLE_NAME: "moving",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        START_DATE: "start_date",
        TYPE: "type",
        CONDO_ID: "condo_id",
        BLOCK_ID: "block_id",
        UNIT_ID: "unit_id",
        FIRST_NAME: "first_name",
        LAST_NAME: "last_name",
        EMAIL: "email",
        PHONE_NUMBER: "phone_number",
        USER_ROLE: "user_role",
        IS_DEPOSIT: "is_deposit",
        IS_LIFT_PADDING: "is_lift_padding",
        STATUS: "status"
    }
};

export const BAN_USER_TABLE_SCHEMA = {
    TABLE_NAME: "ban_users",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        CONDO_ID: "condo_id",
        TYPE: "type",
        REASON: "reason"
    }
};

export const PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA = {
    TABLE_NAME: "payment_gateway_account",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        GATEWAY: "gateway",
        CONDO_ID: "condo_id",
        MERCHANT_ID: "merchant_id",
        PUBLIC_KEY: "public_key",
        PRIVATE_KEY: "private_key"
    }
};

export const USER_SETTING_TABLE_SCHEMA = {
    TABLE_NAME: "user_settings",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        IS_RECEIVER_PUSH_CHAT: "is_receiver_push_chat",
        IS_RECEIVER_PUSH_GARAGE_SALE: "is_receiver_push_garage_sale",
        IS_RECEIVER_PUSH_CHATTERBOX: "is_receiver_push_chatterbox",
        IS_RECEIVER_PUSH_FIND_A_BUDDY: "is_receiver_push_find_a_buddy",
        IS_RECEIVER_PUSH_LOVE: "is_receiver_push_love",
        CHAT_DESCRIPTION: "chat_description",
        GARAGE_SALE_DESCRIPTION: "garage_sale_description",
        CHATTERBOX_DESCRIPTION: "chatterbox_description",
        FIND_A_BUDDY_DESCRIPTION: "find_a_buddy_description",
        LOVE_DESCRIPTION: "love_description"
    }
};

export const SELL_MY_CAR_SCHEMA = {
    TABLE_NAME: "sell_my_car",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        EMAIL: "email",
        DESCRIPTION: "description"
    }
};

export const SMS_TABLE_SCHEMA = {
    TABLE_NAME: "sms",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TO: "to",
        TYPE: "type",
        USER_MANAGER_ID: "user_manager_id",
        GET_QUOTATION_ID: "get_quotation_id",
        SMS_ID: "sms_id"
    }
};

export const CONDO_NAME_TABLE_SCHEMA = {
    TABLE_NAME: "condo_name",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        NAME: "name"
    }
};

export const HEALTH_TABLE_SCHEMA = {
    TABLE_NAME: "health",
    FIELDS: {
        ID: "id"
    }
};

export const APPLICATION_TABLE_SCHEMA = {
    TABLE_NAME: "application",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        PLATFORM: "platform",
        VERSION: "version",
        IS_LATEST: "is_latest",
        FORCE_UPDATE: "force_update"
    }
};

export const TODO_SCHEMA = {
    TABLE_NAME: "todo",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        USER_ID: "user_id",
        CONTENT: "content"
    }
};

export const NOTIFICATION_TABLE_SCHEMA = {
    TABLE_NAME: "notification",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        TYPE: "type",
        GROUP_TYPE: "group_type",
        TITLE: "title",
        BODY: "body",
        CLICK_ACTION: "click_action",
        ITEM_ID: "item_id",
        IS_READ: "is_read"
    }
};

export const EMAIL_TABLE_SCHEMA = {
    TABLE_NAME: "mail",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        TO: "to",
        TYPE: "type",
        USER_MANAGER_ID: "user_manager_id",
        ITEM_ID: "item_id",
        PARTNER_ID: "partner_id"
    }
};

export const ANNOUNCEMENT_USERS_TABLE_SCHEMA = {
    TABLE_NAME: "announcement_users",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        ANNOUNCEMENT_ID: "announcement_id",
    }
};

export const ANNOUNCEMENT_UNIT_TABLE_SCHEMA = {
    TABLE_NAME: "announcement_unit",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        ANNOUNCEMENT_ID: "announcement_id",
        UNIT_ID: "unit_id",
        ROLE_ID: "role_id",
        IS_RESIDENT: "is_resident"
    }
};

export const FUNCTION_PASSWORD_TABLE_SCHEMA = {
    TABLE_NAME: "function_password",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        CONDO_ID: "condo_id",
        NEW_USER: "new_user",
        DEPOSIT: "deposit",
        ONLINE_FORM: "online_form",
        BOOKING: "booking",
        UNIT_LOG: "unit_log",
        FEEDBACK: "feedback"
    }
};

export const CONDO_SECURITY_TABLE_SCHEMA = {
    TABLE_NAME: "condo_security",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        USER_ID: "user_id",
        CONDO_ID: "condo_id"
    }
};

export const BOOKING_SPECIAL_PRICES = {
    TABLE_NAME: "booking_special_prices",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        FACILITY_ID: "facility_id",
        SLOT_ID: "slot_id",
        TYPE: "type",
        CONDITION: "condition",
        PAYMENT_AMOUNT: "payment_amount",
        DEPOSIT_AMOUNT: "deposit_amount",
        PRIORITY: "priority"
    }
};

export const SLOT_SHARING_RESOURCE_TABLE_SCHEMA = {
    TABLE_NAME: "slot_sharing_resource",
    FIELDS: {
        ID: "id",
        IS_ENABLE: "is_enable",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        SLOT_ID: "slot_id",
        PARTNER_SLOT_ID: "partner_slot_id"
    }
};