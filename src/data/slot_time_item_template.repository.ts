import {BaseRepository} from "./base.repository";
import {SlotTimeItemTemplateDto} from "./sql/models";
import {SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA} from "./sql/schema";
import * as Bluebird from "bluebird";
import {QueryBuilder} from "knex";
import {SlotTimeItemTemplateModel} from "../models";
import {ENABLE_STATUS} from "../libs/constants";

export class SlotTimeItemTemplateRepository extends BaseRepository<SlotTimeItemTemplateDto, SlotTimeItemTemplateModel> {
    constructor() {
        super(SlotTimeItemTemplateDto, SlotTimeItemTemplateModel, {
            fromDto: SlotTimeItemTemplateModel.fromDto,
            toDto: SlotTimeItemTemplateModel.toDto,
        });
    }

    /**
     * Search all slot time types sample default.
     *
     * @param params
     * @param related
     * @param filters
     * @returns {Promise<SlotTimeItemTemplateModel[]>}
     */
    public search(params: any = {}, related: string[] = [], filters: string[] = []): Bluebird<SlotTimeItemTemplateModel[]> {
        let query = () => {
            return (q: QueryBuilder): void => {
                q.where(SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                q.orderBy(SLOT_TIME_ITEM_TEMPLATE_TABLE_SCHEMA.FIELDS.PRIORITY, "ASC");
            };
        };

        return this.findByQuery(query(), related, filters);
    }
}

export default SlotTimeItemTemplateRepository;
