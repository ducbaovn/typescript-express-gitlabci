import {SlotFrequencyRestrictionDto} from "./sql/models";
import {BaseRepository} from "./base.repository";
import {SlotFrequencyRestrictModel} from "../models";

export class SlotFrequencyRestrictionRepository extends BaseRepository<SlotFrequencyRestrictionDto, SlotFrequencyRestrictModel> {
    constructor() {
        super(SlotFrequencyRestrictionDto, SlotFrequencyRestrictModel, {
            fromDto: SlotFrequencyRestrictModel.fromDto,
            toDto: SlotFrequencyRestrictModel.toDto,
        });
    }
}

export default SlotFrequencyRestrictionRepository;
