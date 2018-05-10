import { BaseModel } from "./base.model";
import { Bookshelf, BookshelfMapper, Json, JsonMapper } from "../libs/mapper";
import { CLUSTERING_TABLE_SCHEMA } from "../data/sql/schema";
import { ClusteringMemberModel } from "./clustering_member.model";

export class ClusteringModel extends BaseModel {

    @Json("name")
    @Bookshelf(CLUSTERING_TABLE_SCHEMA.FIELDS.NAME)
    public name: string = undefined;

    @Json("type")
    @Bookshelf(CLUSTERING_TABLE_SCHEMA.FIELDS.TYPE)
    public type: string = undefined;

    @Json({ name: "members", clazz: ClusteringMemberModel, omitEmpty: true })
    @Bookshelf({ relation: "members", clazz: ClusteringMemberModel })
    public members: ClusteringMemberModel[] = undefined;

    public static fromRequest(data: any): ClusteringModel {
        return JsonMapper.deserialize(ClusteringModel, data);
    }

    public static toResponse(model: ClusteringModel): any {
        return JsonMapper.serialize(model);
    }
    public static fromDto(dto: any, filters: string[] = []): ClusteringModel {
        let data = BookshelfMapper.deserialize(ClusteringModel, dto);
        BaseModel.filter(data, filters);
        return data;
    }

    public static toDto(model: ClusteringModel): any {
        return BookshelfMapper.serialize(model);
    }
}

export default ClusteringModel;
