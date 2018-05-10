/**
 * Created by kiettv on 12/26/16.
 */
import { Dto } from "./connection";
import * as Schema from "./schema";
import * as UUID from "uuid";
import { DELETE_STATUS, ENABLE_STATUS, SMS_TYPE, STATUS_REQUEST_USER } from "../../libs/constants";
import { FEED_COMMENT_TABLE_SCHEMA } from "./schema";

export class BaseDto<T> extends Dto.Model<any> {

    public static knex() {
        return Dto.knex;
    }

    private static generateUuid(model: any): void {
        if (model.isNew()) {
            model.set(model.idAttribute, UUID.v4());
        }
    }

    constructor(attributes?: any, isNew?: boolean) {
        super(attributes);
        if (isNew != null) {
            this.isNew = () => {
                return isNew;
            };
        }
    }

    // noinspection JSMethodCanBeStatic
    get idAttribute(): string {
        return "id";
    }

    get isDelete(): string {
        return "is_deleted";
    }

    get hasTimestamps(): string[] {
        return ["created_date", "updated_date"];
    }

    public initialize(): void {
        this.on("saving", BaseDto.generateUuid);
    }
}

export class PaymentSourceDto extends BaseDto<PaymentSourceDto> {
    get tableName(): string {
        return Schema.PAYMENT_SOURCE_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public paymentGatewayAccount(): any {
        return this.belongsTo(PaymentGatewayAccountDto, Schema.PAYMENT_SOURCE_TABLE_SCHEMA.FIELDS.PAYMENT_GATEWAY_ACCOUNT_ID).query(q => {
            q.where(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class PaymentGatewayAccountDto extends BaseDto<PaymentGatewayAccountDto> {
    get tableName(): string {
        return Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

// region Media & Files
export class MediaDto extends BaseDto<MediaDto> {
    get tableName(): string {
        return Schema.MEDIA_TABLE_SCHEMA.TABLE_NAME;
    }
}
// endregion

// region System
export class RoleDto extends BaseDto<RoleDto> {
    get tableName(): string {
        return Schema.ROLE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SessionDto extends BaseDto<SessionDto> {
    get tableName(): string {
        return Schema.SESSION_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.SESSION_TABLE_SCHEMA.FIELDS.USER_ID);
    }
}

export class VariableDto extends BaseDto<VariableDto> {
    get tableName() {
        return Schema.VARIABLE_TABLE_SCHEMA.TABLE_NAME;
    }
}
// endregion

// region Users
export class UserDto extends BaseDto<UserDto> {
    get tableName(): string {
        return Schema.USER_TABLE_SCHEMA.TABLE_NAME;
    }

    public role(): any {
        return this.belongsTo(RoleDto, Schema.USER_TABLE_SCHEMA.FIELDS.ROLE_ID);
    }

    public unit(): any {
        return this.belongsToMany(UnitDto).through(UserUnitDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID).query(q => {
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
            // q.limit(1);
        });
    }
    public userUnit(): any {
        return this.hasMany(UserUnitDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
        });
    }

    public condo(): any {
        return this.belongsToMany(CondoDto).through(UserUnitDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.STATUS}`, STATUS_REQUEST_USER.APPROVE);
            q.limit(1);
        });
    }

    public condoManager(): any {
        return this.belongsToMany(CondoDto).through(UserManagerDto, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
            // q.limit(1);
        });
    }

    public condoSecurity(): any {
        return this.belongsToMany(CondoDto).through(CondoSecurityDto, Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID, Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME}.${Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
            // q.limit(1);
        });
    }

    public setting(): any {
        return this.hasOne(UserSettingDto, Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.USER_ID);
    }
}

export class UserUnitDto extends BaseDto<UserUnitDto> {
    get tableName(): string {
        return Schema.USER_UNIT_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID);
    }
    public condo(): any {
        return this.belongsTo(CondoDto, Schema.USER_UNIT_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }
}

export class UserManagerDto extends BaseDto<UserManagerDto> {
    get tableName(): string {
        return Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
        });
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
        });
    }
}

export class DeviceDto extends BaseDto<DeviceDto> {
    get tableName() {
        return Schema.DEVICE_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID);
    }
}

// endregion

// region Condo
export class CondoDto extends BaseDto<CondoDto> {
    get tableName(): string {
        return Schema.CONDO_TABLE_SCHEMA.TABLE_NAME;
    }

    public manager(): any {
        return this.belongsToMany(UserDto).through(UserManagerDto, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.CONDO_ID, Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED}`, false);
            q.where(`${Schema.USER_MANAGER_TABLE_SCHEMA.TABLE_NAME}.${Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, true);
        });
    }

    public paymentGatewayAccount(): any {
        return this.hasMany(PaymentGatewayAccountDto, Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.PAYMENT_GATEWAY_ACCOUNT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public functionPassword(): any {
        return this.hasMany(FunctionPasswordDto, Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class BlockDto extends BaseDto<BlockDto> {
    get tableName(): string {
        return Schema.BLOCK_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public floors(): any {
        return this.hasMany(FloorDto, Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID).query(q => {
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER, "ASC");
        });
    }
}

export class FloorDto extends BaseDto<FloorDto> {
    get tableName(): string {
        return Schema.FLOOR_TABLE_SCHEMA.TABLE_NAME;
    }

    public block(): any {
        return this.belongsTo(BlockDto, Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID).query(q => {
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public units(): any {
        return this.hasMany(UnitDto, Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID).query(q => {
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER, "ASC");
        });
    }
}

export class UnitDto extends BaseDto<UnitDto> {
    get tableName(): string {
        return Schema.UNIT_TABLE_SCHEMA.TABLE_NAME;
    }

    public floor(): any {
        return this.belongsTo(FloorDto, Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID).query(q => {
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class CondoRulesDto extends BaseDto<CondoRulesDto> {
    get tableName(): string {
        return Schema.CONDO_RULES_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class CouncilMinutesDto extends BaseDto<CouncilMinutesDto> {
    get tableName(): string {
        return Schema.COUNCIL_MINUTES_TABLE_SCHEMA.TABLE_NAME;
    }
}
// endregion

// region Online Form
export class OnlineFormCategoryTemplateDto extends BaseDto<OnlineFormCategoryTemplateDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }

    public subCategories(): any {
        return this.hasMany(OnlineFormSubCategoryTemplateDto, Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID).query(q => {
            q.where(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class OnlineFormSubCategoryTemplateDto extends BaseDto<OnlineFormSubCategoryTemplateDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }

    public category(): any {
        return this.belongsTo(OnlineFormCategoryTemplateDto, Schema.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_TEMPLATE_ID);
    }
}

export class OnlineFormCategoryDto extends BaseDto<OnlineFormCategoryDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public subCategories(): any {
        return this.hasMany(OnlineFormSubCategoryDto, Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID).query(q => {
            q.select(`${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.*`, `${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.PRICE} as price`);
            q.where(`${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
            q.andWhere(`${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
            q.innerJoin(Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME, `${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID}`, `${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
            q.orderBy(`${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}`, "ASC");
        });
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.ONLINE_FORM_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

}

export class OnlineFormSubCategoryDto extends BaseDto<OnlineFormSubCategoryDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public onlineFormCategory(): any {
        return this.belongsTo(OnlineFormCategoryDto, Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID);
    }

    public onlineFormSubCategoryTemplate(): any {
        return this.belongsTo(OnlineFormCategoryTemplateDto, Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_TEMPLATE_ID);
    }

    public price(): any {
        return this.hasOne(OnlineFormFeeDto, Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.ONLINE_FORM_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }
}

export class OnlineFormFeeDto extends BaseDto<OnlineFormFeeDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.TABLE_NAME;
    }

    public subCategory(): any {
        return this.belongsTo(OnlineFormSubCategoryDto, Schema.ONLINE_FORM_FEE_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID);
    }
}

export class OnlineFormDto extends BaseDto<OnlineFormDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_TABLE_SCHEMA.TABLE_NAME;
    }

    public category(): any {
        return this.belongsTo(OnlineFormCategoryDto, Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.ONLINE_FORM_CATEGORY_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.ONLINE_FORM_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

}

export class OnlineFormRequestDto extends BaseDto<OnlineFormRequestDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_REQUEST_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class OnlineFormRequestItemsDto extends BaseDto<OnlineFormRequestItemsDto> {
    get tableName(): string {
        return Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.UNIT_ID);
    }

    public onlineFormSubCategory(): any {
        return this.belongsTo(OnlineFormSubCategoryDto, Schema.ONLINE_FORM_REQUEST_ITEMS_TABLE_SCHEMA.FIELDS.ONLINE_FORM_SUB_CATEGORY_ID);
    }
}

export class LatestTransactionDto extends BaseDto<LatestTransactionDto> {
    get tableName(): string {
        return Schema.LATEST_TRANSACTION_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }
}
// endregion

// region Housing & WhatOn
export class HousingLoanDto extends BaseDto<HousingLoanDto> {
    get tableName(): string {
        return Schema.HOUSING_LOAN_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.HOUSING_LOAN_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class WhatOnDto extends BaseDto<WhatOnDto> {
    get tableName(): string {
        return Schema.WHAT_ON_TABLE_SCHEMA.TABLE_NAME;
    }

    public images(): any {
        return this.hasMany(WhatOnImageDto, Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.WHAT_ON_ID).query(q => {
            q.orderBy(Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX, "ASC");
        });
    }
}

export class WhatOnImageDto extends BaseDto<WhatOnImageDto> {
    get tableName(): string {
        return Schema.WHAT_ON_IMAGE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class WhatOnViewDto extends BaseDto<WhatOnViewDto> {
    get tableName(): string {
        return Schema.WHAT_ON_VIEW_TABLE_SCHEMA.TABLE_NAME;
    }
}
// endregion

// region Announcement & Feedback
export class FeedbackDto extends BaseDto<FeedbackDto> {
    get tableName(): string {
        return Schema.FEEDBACK_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public category(): any {
        return this.belongsTo(FeedbackCategoryDto, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UNIT_ID);
    }

    public resolveBy(): any {
        return this.belongsTo(UserDto, Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.RESOLVE_BY);
    }

    public replies(): any {
        return this.hasMany(FeedbackReplyDto, Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID).query(q => {
            q.where(Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }
}

export class FeedbackReplyDto extends BaseDto<FeedbackReplyDto> {
    get tableName(): string {
        return Schema.FEEDBACK_REPLY_TABLE_SCHEMA.TABLE_NAME;
    }

    public feedback(): any {
        return this.belongsTo(FeedbackDto, Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.FEEDBACK_ID).query(q => {
            q.where(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEEDBACK_REPLY_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }
}

export class FeedbackCategoryDto extends BaseDto<FeedbackCategoryDto> {
    get tableName(): string {
        return Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.FEEDBACK_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
        });
    }
}

export class AnnouncementDto extends BaseDto<AnnouncementDto> {
    get tableName(): string {
        return Schema.ANNOUNCEMENT_TABLE_SCHEMA.TABLE_NAME;
    }

    public images(): any {
        return this.hasMany(AnnouncementImageDto, Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID).query(q => {
            q.orderBy(Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.FIELDS.ORDER_INDEX, "ASC");
        });
    }
}

export class AnnouncementImageDto extends BaseDto<AnnouncementImageDto> {
    get tableName(): string {
        return Schema.ANNOUNCEMENT_IMAGE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class AnnouncementViewDto extends BaseDto<AnnouncementViewDto> {
    get tableName(): string {
        return Schema.ANNOUNCEMENT_VIEW_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class AnnouncementUserDto extends BaseDto<AnnouncementUserDto> {
    get tableName(): string {
        return Schema.ANNOUNCEMENT_USERS_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class AnnouncementUnitDto extends BaseDto<AnnouncementUnitDto> {
    get tableName(): string {
        return Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.TABLE_NAME;
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.UNIT_ID);
    }

    public announcement(): any {
        return this.belongsTo(UnitDto, Schema.ANNOUNCEMENT_UNIT_TABLE_SCHEMA.FIELDS.ANNOUNCEMENT_ID);
    }
}
// endregion

// region Useful Contacts
/**
 * Useful category template DTO.
 */
export class UsefulCategoryTemplateDto extends BaseDto<UsefulCategoryTemplateDto> {
    get tableName(): string {
        return Schema.USEFUL_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }

    public subCategories(): any {
        return this.hasMany(UsefulSubCategoryTemplateDto, Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CATEGORY_ID).query(q => {
            q.where(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        });
    }
}

/**
 * Useful sub-category template DTO.
 */
export class UsefulSubCategoryTemplateDto extends BaseDto<UsefulSubCategoryTemplateDto> {
    get tableName(): string {
        return Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }

    public category(): any {
        return this.belongsTo(UsefulCategoryTemplateDto, Schema.USEFUL_SUB_CATEGORY_TEMPLATE_TABLE_SCHEMA.FIELDS.CATEGORY_ID);
    }
}

/**
 * Useful contacts category DTO. Relationship condo and contains list sub-categories.
 */
export class UsefulContactsCategoryDto extends BaseDto<UsefulContactsCategoryDto> {
    get tableName(): string {
        return Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.USEFUL_CONTACT_CATEGORY_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    // Has many sub-categories inside the category.
    public subCategories(): any {
        return this.hasMany(UsefulContactsSubCategoryDto, Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID).query(q => {
            q.where(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.andWhere(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        });
    }

    // Has many NOT EMPTY sub-categories inside the category.
    public subCategoriesNotEmpty(): any {
        return this.hasMany(UsefulContactsSubCategoryDto, Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID).query(q => {
            q.where(`${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
            q.where(`${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
            q.innerJoin(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME, `${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID}`, `${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
            q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
            q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
            q.where(`${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME}.${Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.EXPIRY_DATE}`, ">", new Date());
            q.groupBy(`${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.ID}`);
            q.orderByRaw(`lower(${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME}.${Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.NAME}) ASC`);
        });
    }

    // Relationship not filter only for system admin.
    public subCategoriesNotFilter(): any {
        return this.hasMany(UsefulContactsSubCategoryDto, Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID).query(q => {
            q.orderBy(Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
        });
    }
}

/**
 * Useful contacts sub-category DTO.
 */
export class UsefulContactsSubCategoryDto extends BaseDto<UsefulContactsSubCategoryDto> {
    get tableName(): string {
        return Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public category(): any {
        return this.belongsTo(UsefulContactsCategoryDto, Schema.USEFUL_CONTACT_SUB_CATEGORY_TABLE_SCHEMA.FIELDS.CATEGORY_ID);
    }

    public advertisingCondos(): any {
        return this.hasMany(AdvertisingCondoDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID).query(q => {
            q.where(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
        });
    }
}
// endregion

// region Garage Sale
export class GarageSaleDto extends BaseDto<GarageSaleDto> {
    get tableName(): string {
        return Schema.GARAGE_SALE_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }
}

export class GarageSaleCategoryDto extends BaseDto<GarageSaleCategoryDto> {
    get tableName(): string {
        return Schema.GARAGE_SALE_CATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class GarageSaleLikeDto extends BaseDto<GarageSaleLikeDto> {
    get tableName(): string {
        return Schema.GARAGE_SALE_LIKE_TABLE_SCHEMA.TABLE_NAME;
    }
}
// endregion

// region Advertising
/**
 * Advertiser DTO.
 */
export class AdvertiserDto extends BaseDto<AdvertiserDto> {
    get tableName(): string {
        return Schema.ADVERTISER_TABLE_SCHEMA.TABLE_NAME;
    }
}

/**
 * Advertising template DTO.
 */
export class AdvertisingTemplateDto extends BaseDto<AdvertisingTemplateDto> {
    get tableName(): string {
        return Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }

    public advertiser(): any {
        return this.belongsTo(AdvertiserDto, Schema.ADVERTISING_TEMPLATE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID);
    }

    // List picture inside the template.
    public pictures(): any {
        return this.hasMany(AdvertisingImageDto, Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.TEMPLATE_ID).query(q => {
            q.orderBy(Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.IMAGE_NAME, "ASC");
        });
    }
    // rating avg
    public templateRatings(): any {
        return this.hasOne(RatingAdvertisingTemplateDto, Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID).query(q => {
            q.select(Dto.knex.raw(`${Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID}, ((20*5 + SUM(${Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.TABLE_NAME}.${Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.RATING_VALUE}))::FLOAT / (COUNT(*) + 20))::FLOAT AS avr_rating`));
            q.groupBy(Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.FIELDS.TEMPLATE_ID);
        });
    }
}

/**
 * Advertising template DTO.
 */
export class RatingAdvertisingTemplateDto extends BaseDto<AdvertisingTemplateDto> {
    get tableName(): string {
        return Schema.RATING_ADVERTISING_TEMPLATE_SCHEMA.TABLE_NAME;
    }
}

/**
 * Advertising image DTO. Contains all pictures support for advertising template.
 * Relationship to Advertising Template.
 */
export class AdvertisingImageDto extends BaseDto<AdvertisingImageDto> {
    get tableName(): string {
        return Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.TABLE_NAME;
    }

    public advertisingTemplate(): any {
        return this.belongsTo(AdvertisingTemplateDto, Schema.ADVERTISING_IMAGE_TABLE_SCHEMA.FIELDS.TEMPLATE_ID);
    }
}

/**
 * Advertising condo DTO. Contains template that assigned to condo.
 * Relationship:
 *  a. Advertiser
 *  b. Condo.
 *  c. Useful Contacts - Sub-category.
 *  d. Advertising Template.
 */
export class AdvertisingCondoDto extends BaseDto<AdvertisingCondoDto> {
    get tableName(): string {
        return Schema.ADVERTISING_CONDO_TABLE_SCHEMA.TABLE_NAME;
    }

    public advertiser(): any {
        return this.belongsTo(AdvertiserDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.ADVERTISER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public category(): any {
        return this.belongsTo(UsefulContactsCategoryDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.CATEGORY_ID);
    }

    public subCategory(): any {
        return this.belongsTo(UsefulContactsSubCategoryDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.SUB_CATEGORY_ID);
    }

    public advertisingTemplate(): any {
        return this.belongsTo(AdvertisingTemplateDto, Schema.ADVERTISING_CONDO_TABLE_SCHEMA.FIELDS.TEMPLATE_ID);
    }
}
// endregion

// region Facilities
/**
 * Frequency restriction DTO entity.
 */
export class SlotFrequencyRestrictionDto extends BaseDto<SlotFrequencyRestrictionDto> {
    get tableName(): string {
        return Schema.SLOT_FREQUENCY_RESTRICTION_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SlotRestrictionTypeDto extends BaseDto<SlotRestrictionTypeDto> {
    get tableName(): string {
        return Schema.SLOT_RESTRICTION_TYPE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SlotDurationTypeDto extends BaseDto<SlotDurationTypeDto> {
    get tableName(): string {
        return Schema.SLOT_DURATION_TYPE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class FacilityTypeDto extends BaseDto<SlotRestrictionTypeDto> {
    get tableName(): string {
        return Schema.FACILITY_TYPE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class FacilityDto extends BaseDto<FacilityDto> {
    get tableName(): string {
        return Schema.FACILITIES_TABLE_SCHEMA.TABLE_NAME;
    }

    public slots(): any {
        return this.hasMany(SlotDto, Schema.SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID).query(q => {
            q.where(Schema.SLOT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.SLOT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.orderBy(Schema.SLOT_TABLE_SCHEMA.FIELDS.NAME, "ASC");
        });
    }

    public restrictions(): any {
        return this.hasMany(SlotRestrictionDto, Schema.SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }
}

export class SlotTypeDto extends BaseDto<SlotTypeDto> {
    get tableName(): string {
        return Schema.SLOT_TYPE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SlotTimeTypeDto extends BaseDto<SlotTimeTypeDto> {
    get tableName(): string {
        return Schema.SLOT_TIME_TYPE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SlotTimeItemTemplateDto extends BaseDto<SlotTimeItemTemplateDto> {
    get tableName(): string {
        return Schema.SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class SlotTimeDto extends BaseDto<SlotTimeDto> {
    get tableName(): string {
        return Schema.SLOT_TIME_TABLE_SCHEMA.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }

    public slot(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID);
    }

    public timeItems(): any {
        return this.hasMany(SlotTimeItemDto, Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID);
    }

    public durations(): any {
        return this.hasMany(SlotDurationDto, Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID)
        .query(q => {
            q.orderBy(Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.START_TIME, "ASC");
        });
    }
}

export class SlotTimeItemDto extends BaseDto<SlotTimeItemDto> {
    get tableName(): string {
        return Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.TABLE_NAME;
    }

    public slotTime(): any {
        return this.belongsTo(SlotTimeDto, Schema.SLOT_TIME_ITEM_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID);
    }
}

export class SlotRuleDto extends BaseDto<SlotRuleDto> {
    get tableName(): string {
        return Schema.SLOT_RULES_TABLE_SCHEMA.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_RULES_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }

}

/**
 * Slot Restriction DTO entity.
 * Related:
 * a. Frequency Restriction with numbers of hours per the each type.
 */
export class SlotRestrictionDto extends BaseDto<SlotRestrictionDto> {
    get tableName(): string {
        return Schema.SLOT_RESTRICTION_TABLE_SCHEMA.TABLE_NAME;
    }

    public frequencyRestriction(): any {
        return this.belongsTo(SlotFrequencyRestrictionDto, Schema.SLOT_RESTRICTION_TABLE_SCHEMA.FIELDS.BOOKING_RESTRICT_UNIT_ID);
    }

}

/**
 * Slot DTO entity.
 */
export class SlotDto extends BaseDto<SlotDto> {
    get tableName(): string {
        return Schema.SLOT_TABLE_SCHEMA.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }

    public rule(): any {
        return this.belongsTo(SlotRuleDto, Schema.SLOT_TABLE_SCHEMA.FIELDS.SLOT_RULE_ID);
    }

    public slotTime(): any {
        return this.hasMany(SlotTimeDto, Schema.SLOT_TIME_TABLE_SCHEMA.FIELDS.SLOT_ID);
    }

    public specialPrices(): any {
        return this.hasMany(BookingSpecialPricesDto, Schema.BOOKING_SPECIAL_PRICES.FIELDS.SLOT_ID)
            .query(q => {
                q.where(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.where(Schema.BOOKING_SPECIAL_PRICES.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                q.orderBy(Schema.BOOKING_SPECIAL_PRICES.FIELDS.PRIORITY, "ASC");
                q.orderBy(Schema.BOOKING_SPECIAL_PRICES.FIELDS.CREATED_DATE, "ASC");
            });
    }

    public partnerSlots(): any {
        return this.belongsToMany(SlotDto).through(SlotSharingResourceDto, Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.SLOT_ID, Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.PARTNER_SLOT_ID)
            .query(q => {
                q.where(`${Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.TABLE_NAME}.${Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.IS_DELETED}`, DELETE_STATUS.NO);
                q.where(`${Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.TABLE_NAME}.${Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.FIELDS.IS_ENABLE}`, ENABLE_STATUS.YES);
            });
    }
}

export class SlotDurationDto extends BaseDto<SlotDurationDto> {
    get tableName(): string {
        return Schema.SLOT_DURATION_TABLE_SCHEMA.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }

    public slotTime(): any {
        return this.belongsTo(SlotTimeDto, Schema.SLOT_DURATION_TABLE_SCHEMA.FIELDS.SLOT_TIME_ID);
    }
}

// endregion

// region Booking
export class PaymentStatusCategory extends BaseDto<PaymentStatusCategory> {
    get tableName(): string {
        return Schema.PAYMENT_STATUS_CATEGORIES_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class BookingItemDto extends BaseDto<BookingItemDto> {
    get tableName(): string {
        return Schema.BOOKING_ITEM_TABLE_SCHEMA.TABLE_NAME;
    }

    public slot(): any {
        return this.belongsTo(SlotDto, Schema.BOOKING_ITEM_TABLE_SCHEMA.FIELDS.SLOT_ID);
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.BOOKING_ITEM_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }
}

export class BookingDto extends BaseDto<BookingDto> {
    get tableName(): string {
        return Schema.BOOKING_TABLE_SCHEMA.TABLE_NAME;
    }

    public items(): any {
        return this.hasMany(BookingItemDto, Schema.BOOKING_ITEM_TABLE_SCHEMA.FIELDS.BOOKING_ID);
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.BOOKING_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.BOOKING_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public block(): any {
        return this.belongsTo(BlockDto, Schema.BOOKING_TABLE_SCHEMA.FIELDS.BLOCK_ID);
    }

    public floor(): any {
        return this.belongsTo(FloorDto, Schema.BOOKING_TABLE_SCHEMA.FIELDS.FLOOR_ID);
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.BOOKING_TABLE_SCHEMA.FIELDS.UNIT_ID);
    }
    public transaction(): any {
        return this.hasOne(TransactionHistoryDto, Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID);
    }
}

// endregion

// region Chatterbox
/**
 * Chatterbox DTO
 */
export class FeedDto extends BaseDto<FeedDto> {
    get tableName(): string {
        return Schema.FEED_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEED_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.GARAGE_SALE_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public comments(): any {
        return this.hasMany(FeedCommentDto, Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID)
            .query(q => {
                q.where(FEED_COMMENT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                q.orderBy(FEED_COMMENT_TABLE_SCHEMA.FIELDS.CREATED_DATE, "ASC");
            });
    }
}

/**
 * Chatterbox like DTO
 */
export class FeedLikeDto extends BaseDto<FeedLikeDto> {
    get tableName(): string {
        return Schema.FEED_LIKE_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEED_LIKE_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public feed(): any {
        return this.belongsTo(FeedDto, Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID);
    }
}

/**
 * Chatterbox comment DTO
 */
export class FeedCommentDto extends BaseDto<FeedCommentDto> {
    get tableName(): string {
        return Schema.FEED_COMMENT_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    public feed(): any {
        return this.belongsTo(FeedDto, Schema.FEED_COMMENT_TABLE_SCHEMA.FIELDS.FEED_ID);
    }
}

/**
 * Chatterbox comment like
 */
export class FeedCommentLikeDto extends BaseDto<FeedCommentLikeDto> {
    get tableName(): string {
        return Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.FEED_COMMENT_LIKE_TABLE_SCHEMA.FIELDS.USER_ID);
    }
}
// endregion

// region Transaction History
/**
 * Transaction History DTO entity.
 * Relations:
 * a. Condo Info
 * b. User Info
 * c. Relationship with Booking, OnlineForm, GarageSale. Please see all item type in [constants.ts]->[TRANSACTION_ITEM_TYPE]
 */
export class TransactionHistoryDto extends BaseDto<TransactionHistoryDto> {
    get tableName(): string {
        return Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.USER_ID);
    }

    // Relationship with [Booking Facility] if item type is: BookFacility
    public bookFacility(): any {
        return this.belongsTo(BookingDto, Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID);
    }

    // Relationship with [Online Form] if item type is: OnlineForm
    public onlineForm(): any {
        return this.belongsTo(OnlineFormDto, Schema.TRANSACTION_HISTORY_TABLE_SCHEMA.FIELDS.ITEM_ID);
    }
}
// endregion

export class ContractDto extends BaseDto<ContractDto> {
    get tableName(): string {
        return Schema.CONTRACT_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class GetQuotationSubcategoryDto extends BaseDto<ContractDto> {
    get tableName(): string {
        return Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.TABLE_NAME;
    }

    public services(): any {
        return this.hasMany(GetQuotationServiceDto, Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID).query(q => {
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public notExpiredServices(): any {
        return this.hasMany(GetQuotationServiceDto, Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID).query(q => {
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.EXPIRY_DATE, ">", new Date());
        });
    }
}

export class GetQuotationServiceDto extends BaseDto<ContractDto> {
    get tableName(): string {
        return Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.TABLE_NAME;
    }

    public advertiser(): any {
        return this.belongsTo(AdvertiserDto, Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.ADVERTISER_ID).query(q => {
            q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.ADVERTISER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public subcategory(): any {
        return this.belongsTo(GetQuotationSubcategoryDto, Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.SUBCATEGORY_ID).query(q => {
            q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GET_QUOTATION_SUBCATEGORY_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public smsCount(): any {
        return this.hasMany(SmsDto, Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID).query(q => {
            q.where(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.SMS_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.SMS_TABLE_SCHEMA.FIELDS.TYPE, SMS_TYPE.GET_QUOTATION);
        });
    }

    public emailCount(): any {
        return this.hasMany(EmailDto, Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID).query(q => {
            q.where(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.EMAIL_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.EMAIL_TABLE_SCHEMA.FIELDS.TYPE, SMS_TYPE.GET_QUOTATION);
        });
    }
}

export class MovingDto extends BaseDto<MovingDto> {
    get tableName(): string {
        return Schema.MOVING_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.MOVING_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public block(): any {
        return this.belongsTo(BlockDto, Schema.MOVING_TABLE_SCHEMA.FIELDS.BLOCK_ID).query(q => {
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public unit(): any {
        return this.belongsTo(UnitDto, Schema.MOVING_TABLE_SCHEMA.FIELDS.UNIT_ID).query(q => {
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class ClusteringDto extends BaseDto<ClusteringDto> {
    get tableName(): string {
        return Schema.CLUSTERING_TABLE_SCHEMA.TABLE_NAME;
    }

    public members(): any {
        return this.hasMany(ClusteringMemberDto, Schema.CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CLUSTERING_ID);
    }
}

export class ClusteringMemberDto extends BaseDto<ClusteringMemberDto> {
    get tableName(): string {
        return Schema.CLUSTERING_MEMBERS_TABLE_SCHEMA.TABLE_NAME;
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CONDO_ID);
    }
}
export class BanUserDto extends BaseDto<BanUserDto> {
    get tableName(): string {
        return Schema.BAN_USER_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.BAN_USER_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.BAN_USER_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class SuspendDto extends BaseDto<SuspendDto> {
    get tableName(): string {
        return Schema.SLOT_SUSPENSION_TABLE_SCHEMA.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.FACILITY_ID);
    }

    public slot(): any {
        return this.belongsTo(SlotDto, Schema.SLOT_SUSPENSION_TABLE_SCHEMA.FIELDS.SLOT_ID);
    }
}
export class UserSettingDto extends BaseDto<UserSettingDto> {
    get tableName(): string {
        return Schema.USER_SETTING_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.USER_SETTING_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class SellMyCarDto extends BaseDto<SellMyCarDto> {
    get tableName(): string {
        return Schema.SELL_MY_CAR_SCHEMA.TABLE_NAME;
    }
}

export class SmsDto extends BaseDto<SmsDto> {
    get tableName(): string {
        return Schema.SMS_TABLE_SCHEMA.TABLE_NAME;
    }

    public userManager(): any {
        return this.belongsTo(UserManagerDto, Schema.SMS_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID).query(q => {
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public getQuotation(): any {
        return this.belongsTo(GetQuotationServiceDto, Schema.SMS_TABLE_SCHEMA.FIELDS.GET_QUOTATION_ID).query(q => {
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class CondoNameDto extends BaseDto<CondoNameDto> {
    get tableName(): string {
        return Schema.CONDO_NAME_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class ApplicationDto extends BaseDto<ApplicationDto> {
    get tableName(): string {
        return Schema.APPLICATION_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class TodoDto extends BaseDto<TodoDto> {
    get tableName(): string {
        return Schema.TODO_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.TODO_SCHEMA.FIELDS.USER_ID);
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.TODO_SCHEMA.FIELDS.CONDO_ID);
    }
}

export class NotificationDto extends BaseDto<NotificationDto> {
    get tableName(): string {
        return Schema.NOTIFICATION_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.NOTIFICATION_TABLE_SCHEMA.FIELDS.USER_ID);
    }
}

export class EmailDto extends BaseDto<EmailDto> {
    get tableName(): string {
        return Schema.EMAIL_TABLE_SCHEMA.TABLE_NAME;
    }

    public userManager(): any {
        return this.belongsTo(UserManagerDto, Schema.EMAIL_TABLE_SCHEMA.FIELDS.USER_MANAGER_ID).query(q => {
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.USER_MANAGER_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }

    public getQuotation(): any {
        return this.belongsTo(GetQuotationServiceDto, Schema.EMAIL_TABLE_SCHEMA.FIELDS.ITEM_ID).query(q => {
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
            q.where(Schema.GET_QUOTATION_SERVICE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
        });
    }
}

export class FunctionPasswordDto extends BaseDto<FunctionPasswordDto> {
    get tableName(): string {
        return Schema.FUNCTION_PASSWORD_TABLE_SCHEMA.TABLE_NAME;
    }
}

export class CondoSecurityDto extends BaseDto<CondoSecurityDto> {
    get tableName(): string {
        return Schema.CONDO_SECURITY_TABLE_SCHEMA.TABLE_NAME;
    }

    public user(): any {
        return this.belongsTo(UserDto, Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.USER_ID).query(q => {
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.USER_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
        });
    }

    public condo(): any {
        return this.belongsTo(CondoDto, Schema.CONDO_SECURITY_TABLE_SCHEMA.FIELDS.CONDO_ID).query(q => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
        });
    }
}

export class BookingSpecialPricesDto extends BaseDto<BookingSpecialPricesDto> {
    get tableName(): string {
        return Schema.BOOKING_SPECIAL_PRICES.TABLE_NAME;
    }

    public facility(): any {
        return this.belongsTo(FacilityDto, Schema.BOOKING_SPECIAL_PRICES.FIELDS.FACILITY_ID);
    }

    public slot(): any {
        return this.belongsTo(FacilityDto, Schema.BOOKING_SPECIAL_PRICES.FIELDS.SLOT_ID);
    }
}

export class SlotSharingResourceDto extends BaseDto<SlotSharingResourceDto> {
    get tableName(): string {
        return Schema.SLOT_SHARING_RESOURCE_TABLE_SCHEMA.TABLE_NAME;
    }
}