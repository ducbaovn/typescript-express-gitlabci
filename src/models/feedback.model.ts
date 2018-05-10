import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import {BaseModel} from "./base.model";
import {CondoModel, FeedbackCategoryModel, UnitModel, UserModel, FeedbackReplyModel} from "./";
import {FeedbackDto, UserDto, FeedbackCategoryDto, UnitDto, CondoDto, FeedbackReplyDto} from "../data/sql/models";
import {FEEDBACK_STATUS, TIME_ZONE} from "../libs/constants";

export class FeedbackModel extends BaseModel {

    public title: string;
    public content: string;
    public categoryId: string;
    public userId: string;
    public condoId: string;
    public unitId: string;
    public status: string;
    public dateReceived: momentTz.Moment;
    public dateResolved: momentTz.Moment;
    public resolveBy: string;
    public images: string[];
    public unit: UnitModel;
    public condo: CondoModel;
    // custom fields for report
    public totalFeedback: number;
    public month: momentTz.Moment;
    public note: string;
    public ticketNumber: string;

    public user: UserModel;
    public category: FeedbackCategoryModel;
    public resolveByUser: UserModel;
    public replies: FeedbackReplyModel[] = [];

    public isNew: boolean;
    public numberPendingDay: number;

    public static fromDto(dto: FeedbackDto, filters: string[] = []): FeedbackModel {
        let model: FeedbackModel = null;
        if (dto != null) {
            model = new FeedbackModel();
            model.id = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.USER_ID));
            model.title = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TITLE));
            model.content = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONTENT));
            model.status = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS));
            model.categoryId = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID));
            model.dateReceived = BaseModel.getDate(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED));
            model.dateResolved = BaseModel.getDate(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RESOLVED));
            model.resolveBy = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.RESOLVE_BY));
            model.images = BaseModel.getArrayString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            // start custom fields for report
            let totalFeedback = BaseModel.getNumber(dto.get("total_feedback"));
            let month = BaseModel.getDate(dto.get("month"));
            if (totalFeedback) {
                model.totalFeedback = totalFeedback;
            }
            if (month) {
                model.month = month;
            }
            // end custom fields for report
            model.condoId = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID));
            let userRelation: UserDto = dto.related("user") as UserDto;
            if (userRelation != null) {
                let userModel = UserModel.fromDto(userRelation, filters);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

            let resolveByRelation: UserDto = dto.related("resolveBy") as UserDto;
            if (resolveByRelation != null) {
                let userModel = UserModel.fromDto(resolveByRelation, filters);
                if (userModel != null) {
                    model.resolveByUser = userModel;
                }
            }

            let categoryRelation: FeedbackCategoryDto = dto.related("category") as FeedbackCategoryDto;
            if (categoryRelation != null) {
                let feedbackCategoryModel = FeedbackCategoryModel.fromDto(categoryRelation, filters);
                if (feedbackCategoryModel != null) {
                    model.category = feedbackCategoryModel;
                }
            }

            let unitRelation: UnitDto = dto.related("unit") as UnitDto;
            if (unitRelation != null && unitRelation.id != null) {
                let unitModel = UnitModel.fromDto(unitRelation, filters);
                if (unitModel != null) {
                    model.unit = unitModel;
                }
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;
            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, filters);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            let repliesRelation: any = dto.related("replies");
            if (repliesRelation != null && repliesRelation.models != null) {
                repliesRelation.forEach(modelDto => {
                    let replyDto = modelDto as FeedbackReplyDto;
                    model.replies.push(FeedbackReplyModel.fromDto(replyDto, filters));
                });
            }

            model.note = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE));

            let timezone = model.condo ? model.condo.timezone : TIME_ZONE.TIME_ZONE_DEFAULT;
            if (model.status === FEEDBACK_STATUS.PENDING) {
                model.numberPendingDay = momentTz().tz(timezone).startOf("date").diff(momentTz(model.dateReceived).tz(timezone).startOf("date"), "days");
            }
            if (model.status === FEEDBACK_STATUS.RESOLVED) {
                model.numberPendingDay = momentTz(model.dateResolved).tz(timezone).startOf("date").diff(momentTz(model.dateReceived).tz(timezone).startOf("date"), "days");
            }
            model.ticketNumber = BaseModel.getString(dto.get(Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TICKET_NUMBER));
        }
        FeedbackModel.filter(model, filters);
        return model;
    }

    public static fromRequest(req: express.Request): FeedbackModel {
        let ret = new FeedbackModel();
        if (req != null && req.body != null) {
            ret.id = this.getString(req.body.id);
            ret.status = this.getString(req.body.status);
            ret.title = this.getString(req.body.title);
            ret.content = this.getString(req.body.content);
            ret.categoryId = this.getString(req.body.categoryId);
            ret.userId = this.getString(req.body.userId);
            ret.condoId = this.getString(req.body.condoId);
            ret.unitId = this.getString(req.body.unitId);
            ret.images = this.getArrayString(req.body.images);
            ret.note = this.getString(req.body.note);
            ret.status = FEEDBACK_STATUS.PENDING;
        }
        return ret;
    }


    public static toDto(model: FeedbackModel): any {
        let dto = {};
        if (model.id != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }
        if (model.isEnable != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }
        if (model.isDeleted != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }
        if (model.updatedDate != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UPDATED_DATE] = model.updatedDate;
        }
        if (model.status != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.STATUS] = model.status;
        }
        if (model.title != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TITLE] = model.title;
        }
        if (model.content != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONTENT] = model.content;
        }
        if (model.categoryId != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.FEEDBACK_CATEGORY_ID] = model.categoryId;
        }
        if (model.userId != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }
        if (model.condoId != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }
        if (model.unitId != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.UNIT_ID] = model.unitId;
        }
        if (model.images != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.images;
        }
        if (model.dateReceived != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RECEIVED] = model.dateReceived;
        }
        if (model.dateResolved != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.DATE_RESOLVED] = model.dateResolved;
        }
        if (model.resolveBy != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.RESOLVE_BY] = model.resolveBy;
        }
        if (model.note != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.NOTE] = model.note;
        }
        if (model.ticketNumber != null) {
            dto[Schema.FEEDBACK_TABLE_SCHEMA.FIELDS.TICKET_NUMBER] = model.ticketNumber;
        }

        return dto;
    }
}

export default FeedbackModel;
