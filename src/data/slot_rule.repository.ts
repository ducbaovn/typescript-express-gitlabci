import * as Bluebird from "bluebird";
import {SlotRuleDto} from "./sql/models";
import {SlotRuleModel} from "../models";
import {BaseRepository} from "./base.repository";
import {SlotRestrictionRepository} from "./index";
import {Logger} from "../libs/index";

export class SlotRuleRepository extends BaseRepository<SlotRuleDto, SlotRuleModel> {
    constructor() {
        super(SlotRuleDto, SlotRuleModel, {
            fromDto: SlotRuleModel.fromDto,
            toDto: SlotRuleModel.toDto,
        });
    }

    /**
     * Function save rule for slot with list restriction for the each slot time type.
     *
     * @param dataModel
     * @returns {Bluebird<U>}
     */
    public saveRuleForSlot(dataModel: SlotRuleModel): Bluebird<SlotRuleModel> {
        return Bluebird.resolve()
            .then(() => {
                return this.insertGet(dataModel);
            })
            .catch(err => {
                return Bluebird.reject(err);
            });
    }
}

export default SlotRuleRepository;
