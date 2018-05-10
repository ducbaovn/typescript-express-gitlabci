/**
 * Created by davidho on 1/9/17.
 */
import * as Schema from "../data/sql/schema";
import {BaseModel} from "./base.model";
import {DeviceDto, UserDto} from "../data/sql/models";
import {HEADERS, JWT_WEB_TOKEN} from "../libs/constants";
import {UserModel} from "./user.model";

export class DeviceModel extends BaseModel {
    public userId: string;
    public userAgent: string;
    public deviceId: string;
    public registrarId: string;
    public deviceOs: string;
    public deviceName: string;
    public deviceModel: string;
    public osVersion: string;
    public appVersion: string;
    public buildVersion: string;
    public isSandBox: boolean;
    public user: UserModel;
    /**
     * Parse to DeviceModel from header request.
     * @param data
     * @param userId
     * @returns {DeviceModel}
     */
    public static fromRequest(data: any, userId: string): DeviceModel {
        let model = new DeviceModel();

        model.userId = userId;
        model.userAgent = BaseModel.getString(data[HEADERS.USER_AGENT]);
        model.deviceId = BaseModel.getString(data[HEADERS.DEVICE_ID], JWT_WEB_TOKEN.DEFAULT_CLIENT);
        model.registrarId = BaseModel.getString(data[HEADERS.REGISTRAR_ID]);
        model.deviceOs = BaseModel.getString(data[HEADERS.DEVICE_OS]);
        model.deviceName = BaseModel.getString(data[HEADERS.DEVICE_NAME]);
        model.deviceModel = BaseModel.getString(data[HEADERS.DEVICE_MODEL]);
        model.osVersion = BaseModel.getString(data[HEADERS.OS_VERSION]);
        model.appVersion = BaseModel.getString(data[HEADERS.APP_VERSION]);
        model.buildVersion = BaseModel.getString(data[HEADERS.BUILD_VERSION]);

        return model;
    }

    /**
     * Convert to DeviceModel from DTO entity.
     * @returns {DeviceModel}
     * @param dto
     */
    public static fromDto(dto: DeviceDto, filters: string[] = []): DeviceModel {
        let model: DeviceModel = null;
        if (dto != null) {
            model = new DeviceModel();
            model.id = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.ID));
            model.createdDate = BaseModel.getDate(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.CREATED_DATE));
            model.updatedDate = BaseModel.getDate(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.UPDATED_DATE));

            model.userId = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID));
            model.deviceId = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_ID));
            model.registrarId = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.REGISTRAR_ID));
            model.deviceOs = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_OS));
            model.deviceModel = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_MODEL));
            model.deviceName = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_NAME));
            model.osVersion = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.OS_VERSION));
            model.appVersion = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.APP_VERSION));
            model.buildVersion = BaseModel.getString(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.BUILD_VERSION));
            model.isSandBox = BaseModel.getBoolean(dto.get(Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_SANDBOX), false);

            let userRelation: UserDto = dto.related("user") as UserDto;

            if (userRelation != null && userRelation.id != null) {
                let userModel = UserModel.fromDto(userRelation, [...filters, "password"]);
                if (userModel != null) {
                    model.user = userModel;
                }
            }
        }
        DeviceModel.filter(model, filters);

        return model;
    }


    /**
     * Convert to DTO entity from request model.
     * @param model
     * @returns {{}}
     */

    public static toDto(model: DeviceModel): any {
        let dto = {};

        if (model.id != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.ID] = model.id;
        }

        if (model.userId != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID] = model.userId;
        }

        if (model.deviceId != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_ID] = model.deviceId;
        }

        if (model.registrarId != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.REGISTRAR_ID] = model.registrarId;
        } else {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.REGISTRAR_ID] = "";
        }

        if (model.deviceOs != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_OS] = model.deviceOs;
        }

        if (model.deviceModel != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_MODEL] = model.deviceModel;
        }

        if (model.deviceName != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_NAME] = model.deviceName;
        }

        if (model.osVersion != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.OS_VERSION] = model.osVersion;
        }

        if (model.appVersion != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.APP_VERSION] = model.appVersion;
        }

        if (model.buildVersion != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.BUILD_VERSION] = model.buildVersion;
        }

        if (model.isSandBox != null) {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_SANDBOX] = model.isSandBox;
        } else {
            dto[Schema.DEVICE_TABLE_SCHEMA.FIELDS.IS_SANDBOX] = 1;
        }

        return dto;
    }

}

export default DeviceModel;
