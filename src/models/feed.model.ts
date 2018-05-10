/**
 * Created by davidho on 4/13/17.
 */
import * as Schema from "../data/sql/schema";
import * as express from "express";
import * as momentTz from "moment-timezone";
import { BaseModel } from "./base.model";
import { CondoDto, FeedDto, UserDto } from "../data/sql/models";
import { UserModel, CondoModel, FeedCommentModel, AdvertisingCondoModel } from "./index";
import { FEED_TYPE } from "../libs/constants";

class ExternalLink {
    public website: string;
    public phone: string;
    public isPhoneEnable: boolean;
    public isWebsiteEnable: boolean;
}

export class FeedModel extends BaseModel {
    public title: string;
    public content: string;
    public userId: string;
    public condoId: string;
    public type: string;
    public tag: string[];
    public datePost: momentTz.Moment;
    public imageUrl: string;
    public external: ExternalLink;

    public numberOfLike: number;
    public numberOfComment: number;
    public isLike: boolean;
    public isComment: boolean;
    public user: UserModel;
    public condo: CondoModel;
    public comments: FeedCommentModel[];

    constructor() {
        super();
        this.external = new ExternalLink();
    }

    /**
     *
     * @param dto
     * @param filters
     * @returns {FeedModel}
     */
    public static fromDto(dto: FeedDto, filters: string[] = []): FeedModel {
        let model: FeedModel = null;

        if (dto != null) {
            model = new FeedModel();
            model.id = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.ID));
            model.isEnable = BaseModel.getBoolean(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.IS_ENABLE));
            model.isDeleted = BaseModel.getBoolean(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.IS_DELETED));
            model.createdDate = BaseModel.getDate(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.title = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.TITLE));
            model.content = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.CONTENT));
            model.type = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.TYPE));
            model.userId = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.USER_ID));
            model.condoId = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.CONDO_ID));
            model.datePost = BaseModel.getDate(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.DATE_POST));
            model.imageUrl = BaseModel.getString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.IMAGE_URL));
            model.tag = BaseModel.getArrayString(dto.get(Schema.FEED_TABLE_SCHEMA.FIELDS.TAG));

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }

            let condoRelation: CondoDto = dto.related("condo") as CondoDto;

            if (condoRelation != null && condoRelation.id != null) {
                let condoModel = CondoModel.fromDto(condoRelation, [...filters]);
                if (condoModel != null) {
                    model.condo = condoModel;
                }
            }

            let commentRelation: any = dto.related("comments");

            if (commentRelation != null && commentRelation.models != null && commentRelation.models.length > 0) {
                model.comments = [];
                commentRelation.models.forEach(item => {
                    let commentModel = FeedCommentModel.fromDto(item);

                    model.comments.push(commentModel);
                });
            }

        }

        FeedModel.filter(model, filters);

        return model;
    }

    /**
     *
     * @param req
     * @returns {FeedModel}
     */
    public static fromRequest(req: express.Request): FeedModel {
        let ret = new FeedModel();

        if (req != null && req.body != null) {
            ret.title = this.getString(req.body.title);
            ret.content = this.getString(req.body.content, "");
            ret.type = this.getString(req.body.type);
            ret.condoId = this.getString(req.body.condoId);
            ret.imageUrl = this.getString(req.body.imageUrl, "");
        }

        return ret;
    }

    public static fromSponsorAd(sponsorAd: AdvertisingCondoModel): FeedModel {
        let model = new FeedModel();
        model.id = sponsorAd.id;
        model.type = FEED_TYPE.SPONSOR_ADS;
        model.condoId = sponsorAd.condo.id;
        model.condo = sponsorAd.condo;
        model.datePost = sponsorAd.createdDate;
        model.user = new UserModel;
        if (sponsorAd.advertisingTemplate != null && sponsorAd.advertiser != null) {
            model.title = sponsorAd.advertisingTemplate.heading;
            model.content = sponsorAd.advertisingTemplate.desc;
            model.createdDate = sponsorAd.advertisingTemplate.createdDate;
            model.updatedDate = sponsorAd.advertisingTemplate.createdDate;
            if (sponsorAd.advertisingTemplate.pictures != null && sponsorAd.advertisingTemplate.pictures.length > 0) {
                model.imageUrl = sponsorAd.advertisingTemplate.pictures[0].imageUrl;
            }

            model.userId = sponsorAd.advertiser.id;
            model.user.id = sponsorAd.advertiser.id;
            model.user.firstName = sponsorAd.advertisingTemplate.profileName;
            model.user.email = sponsorAd.advertiser.email;
            model.user.phoneNumber = sponsorAd.advertiser.phoneNumber;
            model.user.avatarUrl = sponsorAd.advertisingTemplate.profilePictureUrl;

            model.external.website = sponsorAd.advertisingTemplate.website;
            model.external.phone = sponsorAd.advertisingTemplate.phone;
            model.external.isPhoneEnable = sponsorAd.advertisingTemplate.isPhoneEnable;
            model.external.isWebsiteEnable = sponsorAd.advertisingTemplate.isWebsiteEnable;
        }

        return model;
    }

    /**
     *
     * @param model
     * @returns {{}}
     */
    public static toDto(model: FeedModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.isEnable != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.IS_ENABLE] = model.isEnable;
        }

        if (model.isDeleted != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.IS_DELETED] = model.isDeleted;
        }

        if (model.title != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.TITLE] = model.title;
        }

        if (model.content != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.CONTENT] = model.content;
        }

        if (model.type != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.TYPE] = model.type;
        }

        if (model.userId != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.condoId != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.CONDO_ID] = model.condoId;
        }

        if (model.imageUrl != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.IMAGE_URL] = model.imageUrl;
        }

        if (model.datePost != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.DATE_POST] = model.datePost;
        }

        if (model.tag != null) {
            dto[Schema.FEED_TABLE_SCHEMA.FIELDS.TAG] = model.tag;
        }

        return dto;
    }

    public static fromSuspendRequest(req: express.Request): FeedModel {
        let ret = new FeedModel();

        if (req != null && req.body != null) {
            ret.isEnable = this.getBoolean(req.body.isEnable);
        }

        return ret;
    }
}

export default FeedModel;
