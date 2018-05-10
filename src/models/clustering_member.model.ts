import { BaseModel } from "./base.model";
import { CondoModel } from "./condo.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { CLUSTERING_MEMBERS_TABLE_SCHEMA } from "../data/sql/schema";

export class ClusteringMemberModel extends BaseModel {

    @Json("clusterId")
    @Bookshelf({ name: CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CLUSTERING_ID })
    public cluserId: string = undefined;

    @Json("condoId")
    @Bookshelf({ name: CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CONDO_ID })
    public condoId: string = undefined;

    @Json({ name: "condo", clazz: CondoModel, omitEmpty: true })
    @Bookshelf({ relation: "condo", clazz: CondoModel })
    public condo: CondoModel = undefined;


    public static fromRequest(data: any): ClusteringMemberModel {
        return JsonMapper.deserialize(ClusteringMemberModel, data);
    }

    public static toResponse(model: ClusteringMemberModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): ClusteringMemberModel {
        let data = BookshelfMapper.deserialize(ClusteringMemberModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: ClusteringMemberModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default ClusteringMemberModel;
