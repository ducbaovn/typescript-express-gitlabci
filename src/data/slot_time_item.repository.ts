import {BaseRepository} from "./base.repository";
import {SlotTimeItemDto} from "./sql/models";
import {SlotTimeItemModel} from "../models";

export class SlotTimeItemRepository extends BaseRepository<SlotTimeItemDto, SlotTimeItemModel> {
    constructor() {
        super(SlotTimeItemDto, SlotTimeItemModel, {
            fromDto: SlotTimeItemModel.fromDto,
            toDto: SlotTimeItemModel.toDto,
        });
    }
}

export default SlotTimeItemRepository;
