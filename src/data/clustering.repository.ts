import { BaseRepository } from "./base.repository";
import { ClusteringDto } from "./sql/models";
import { ClusteringModel , CollectionWrap} from "../models";
import { CLUSTERING_TABLE_SCHEMA} from "../data/sql/schema";
import * as Bluebird from "bluebird";
import { } from "../libs/constants";

export class ClusteringRepository extends BaseRepository<ClusteringDto, ClusteringModel> {
    constructor() {
        super(ClusteringDto, ClusteringModel, {
            fromDto: ClusteringModel.fromDto,
            toDto: ClusteringModel.toDto,
        });
    }

    public search(searchParams: any = {}, offset: number, limit: number, related: string[] = [], filters: string[] = []): Bluebird<CollectionWrap<ClusteringModel>> {
        let keyword = searchParams.key || null;
        let isEnable = searchParams.isEnable || null;
        limit = limit || null;
        offset = offset || null;
        let query = (offset?: number, limit?: number, isOrderBy?: boolean) => {
            return (q) => {
                q.where(CLUSTERING_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                if (isEnable != null) {
                    q.where(CLUSTERING_TABLE_SCHEMA, searchParams.isEnable);
                }
                if (keyword !== null) {
                    q.where(q1 => {
                        q1.where(CLUSTERING_TABLE_SCHEMA.FIELDS.NAME, "ILIKE", `%${keyword}%`);
                    });
                }
                if (searchParams.id) {
                    q.where(CLUSTERING_TABLE_SCHEMA.FIELDS.ID, searchParams.id);
                }
                if (limit != null) {
                    q.limit(limit);
                }
                if (offset != null) {
                    q.offset(offset);
                }
                if (isOrderBy) {
                    if (keyword !== null) {
                        q.orderBy(CLUSTERING_TABLE_SCHEMA.FIELDS.NAME, "ASC");
                    } else {
                        q.orderBy(CLUSTERING_TABLE_SCHEMA.FIELDS.UPDATED_DATE, "DESC");
                    }
                }
            };
        };
        return this.countAndQuery(query(), query(offset, limit, true), related, filters);
    }
}
export default ClusteringRepository;
