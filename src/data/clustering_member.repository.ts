import { BaseRepository } from "./base.repository";
import { ClusteringMemberDto } from "./sql/models";
import { ClusteringMemberModel } from "../models";
import { } from "../data/sql/schema";
import * as Bluebird from "bluebird";
import { } from "../libs/constants";

export class ClusteringMemberRepository extends BaseRepository<ClusteringMemberDto, ClusteringMemberModel> {
    constructor() {
        super(ClusteringMemberDto, ClusteringMemberModel, {
            fromDto: ClusteringMemberModel.fromDto,
            toDto: ClusteringMemberModel.toDto,
        });
    }
}
export default ClusteringMemberRepository;
