import {SlotRestrictionDto} from "./sql/models";
import {SlotRestrictionModel} from "../models";
import {BaseRepository} from "./base.repository";

export class SlotRestrictionRepository extends BaseRepository<SlotRestrictionDto, SlotRestrictionModel> {
    constructor() {
        super(SlotRestrictionDto, SlotRestrictionModel, {
            fromDto: SlotRestrictionModel.fromDto,
            toDto: SlotRestrictionModel.toDto,
        });
    }
}

export default SlotRestrictionRepository;
