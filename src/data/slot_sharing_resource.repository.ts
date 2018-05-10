import * as Bluebird from "bluebird";
import {SlotSharingResourceDto} from "./sql/models";
import {SlotSharingResourceModel} from "../models";
import {BaseRepository} from "./base.repository";

export class SlotSharingResourceRepository extends BaseRepository<SlotSharingResourceDto, SlotSharingResourceModel> {
    constructor() {
        super(SlotSharingResourceDto, SlotSharingResourceModel, {
            fromDto: SlotSharingResourceModel.fromDto,
            toDto: SlotSharingResourceModel.toDto,
        });
    }
}

export default SlotSharingResourceRepository;
