import {BaseRepository} from "./base.repository";
import {DeviceDto} from "./sql/models";
import {DeviceModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
/**
 * Created by davidho on 1/9/17.
 */
export class DeviceRepository extends BaseRepository<DeviceDto, DeviceModel> {
    constructor() {
        super(DeviceDto, DeviceModel, {
            fromDto: DeviceModel.fromDto,
            toDto: DeviceModel.toDto,
        });
    }

    public findByUserId(userId: string, related = [], filters = []): Promise<DeviceModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.USER_ID, userId);
        }, related, filters);
    }

    public findByDeviceId(deviceId: string, related = [], filters = []): Promise<DeviceModel> {
        return this.findOneByQuery(q => {
            q.where(Schema.DEVICE_TABLE_SCHEMA.FIELDS.DEVICE_ID, deviceId);
        }, related, filters);
    }
}
export  default DeviceRepository;
