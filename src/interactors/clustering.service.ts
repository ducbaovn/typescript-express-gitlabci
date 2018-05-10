import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { CollectionWrap, ClusteringModel, ClusteringMemberModel, ExceptionModel } from "../models";
import { ClusteringRepository, ClusteringMemberRepository } from "../data";
import { Redis } from "../data/redis/redis";
import { CLUSTERING_TABLE_SCHEMA, CLUSTERING_MEMBERS_TABLE_SCHEMA, CLUSTERING_TYPE_TABLE_SCHEMA } from "../data/sql/schema";
import { ErrorCode, HttpStatus, Logger } from "../libs";
import { CLUSTERING_TYPE } from "../libs/constants";


export class ClusteringService extends BaseService<ClusteringModel, typeof ClusteringRepository> {
    constructor() {
        super(ClusteringRepository);
    }

    public search(searchParams: any, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<ClusteringModel>> {
        return ClusteringRepository.search(searchParams, offset, limit, related, filters);
    }

    public editCluster(model: ClusteringModel): Promise<ClusteringModel> {
        return Promise.resolve()
            .then(() => {
                return ClusteringRepository.findOne(model.id);
            })
            .then((dtoObject) => {
                if (dtoObject == null) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }

                return ClusteringRepository.update(model);
            })
            .then(() => {
                return ClusteringRepository.findOne(model.id, ["members.condo"]);
            });
    }

    public createCluster(model: ClusteringModel): Promise<ClusteringModel> {
        return Promise.resolve()
            .then(() => {
                return ClusteringRepository.insert(model);
            })
            .then((object) => {
                model.id = object.id;
                return Promise.each(model.members, (member) => {
                    member.cluserId = object.id;
                    return ClusteringMemberRepository.insert(member)
                        .tap(() => {
                            let key = Redis.getCondoClusterSetKey(member.condoId, model.type);
                            Redis.getClient().saddAsync(key, member.cluserId)
                                .catch(err => Logger.error(err.message, err));
                        })
                        .catch(err => Logger.error(err.message, err));
                });
            })
            .then(() => {
                return ClusteringRepository.findOne(model.id, ["members.condo"]);
            })
            .tap(object => {
                let key = Redis.getClusteringSetKey(object.id);
                let arr = object.members.map((item) => item.condoId);
                if (arr.length > 0) {
                    Redis.getClient().saddAsync(key, arr);
                } else {
                    // create empty set
                    Redis.getClient().multi()
                        .sadd(key, key)
                        .srem(key, key)
                        .execAsync();
                }
            })
            .catch(err => {
                if (model.id != null) {
                    ClusteringRepository.forceDelete(model.id);
                }
                throw err;
            });
    }
    public remove(clusterId): Promise<boolean> {
        let clusterKey = Redis.getClusteringSetKey(clusterId);
        let existingMember: string[];
        let cluster: ClusteringModel;
        return Promise.resolve()
            .then(() => {
                return ClusteringRepository.findOne(clusterId);
            })
            .then((val) => {
                if (val == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                cluster = val;
                return Redis.getClient().smembersAsync(clusterKey);
            })
            .then((keys: string[]) => {
                if (keys == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                existingMember = keys;
                return ClusteringRepository.findOne(clusterId);
            })
            .then((cluster) => {
                let arr = existingMember.map(member => Redis.getCondoClusterSetKey(member, cluster.type));
                let multi = Redis.getClient().multi();
                arr.forEach(item => {
                    multi.srem(item, clusterId);
                });
                multi.del(clusterKey);
                return multi.execAsync();
            })
            .then(() => {
                return ClusteringRepository.forceDelete(clusterId);
            })
            .then(() => {
                return true;
            });
    }
    public removeMember(clusterId, memberId): Promise<boolean> {
        let clusterKey = Redis.getClusteringSetKey(clusterId);
        let existingMember: Set<string>;
        let cluster: ClusteringModel;
        return Promise.resolve()
            .then(() => {
                return ClusteringRepository.findOne(clusterId);
            })
            .then((val) => {
                if (val == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                cluster = val;
                return Redis.getClient().sismember(clusterKey, memberId);
            })
            .then((ret) => {
                if (ret == null || !ret) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                let key = Redis.getCondoClusterSetKey(memberId, cluster.type);
                return Redis.getClient().multi()
                    .srem(key, clusterId)
                    .srem(clusterKey, memberId)
                    .execAsync();
            })
            .then(() => {
                return ClusteringMemberRepository.deleteByQuery(q => {
                    q.where(CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CLUSTERING_ID, clusterId);
                    q.andWhere(CLUSTERING_MEMBERS_TABLE_SCHEMA.FIELDS.CONDO_ID, memberId);
                });
            })
            .then(() => {
                return true;
            });
    }

    public addMembers(clusterId: string, members: ClusteringMemberModel[] = []): Promise<ClusteringModel> {
        let clusterKey = Redis.getClusteringSetKey(clusterId);
        let existingMember: Set<string>;
        let cluster: ClusteringModel;
        return Promise.resolve()
            .then(() => {
                return ClusteringRepository.findOne(clusterId);
            })
            .then((val) => {
                if (val == null) {
                    throw new ExceptionModel(
                        ErrorCode.RESOURCE.NOT_FOUND.CODE,
                        ErrorCode.RESOURCE.NOT_FOUND.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    );
                }
                cluster = val;
                return Redis.getClient().smembersAsync(clusterKey);
            })
            .then((keys: string[]) => {
                existingMember = new Set<string>(keys);
            })
            .then(() => {
                return Promise.each(members, (member) => {
                    if (!existingMember.has(member.condoId)) {
                        member.cluserId = clusterId;
                        return ClusteringMemberRepository.insert(member)
                            .tap(() => {
                                let key = Redis.getCondoClusterSetKey(member.condoId, cluster.type);
                                Redis.getClient().multi()
                                    .sadd(key, member.cluserId)
                                    .sadd(clusterKey, member.condoId)
                                    .execAsync()
                                    .catch(err => Logger.error(err.message, err));
                            })
                            .catch(err => Logger.error(err.message, err));
                    }
                }).catch(err => Logger.error(err.message, err));
            })
            .then(() => {
                return ClusteringRepository.findOne(clusterId, ["members"]);
            });
    }

    private getListClusterByCondo(condoId: string, feedType: string): Promise<string[]> {
        let key = Redis.getCondoClusterSetKey(condoId, feedType);
        let keyAll = Redis.getCondoClusterSetKey(condoId, CLUSTERING_TYPE.ALL);
        return Redis.getClient().sunionAsync([key, keyAll])
        .then((clusterIds) => {
            return clusterIds == null ? [] : clusterIds;
        })
        .catch(err => {
            return [];
        });
    }

    private getListCondoByListClusters(clusterIds: string[]): Promise<string[]> {
        let clusterKeys = clusterIds.map(clusterId => Redis.getClusteringSetKey(clusterId));
        return Promise.resolve()
        .then(() => {
            if (clusterKeys.length > 0) {
                return Redis.getClient().sunionAsync(clusterKeys)
                .then(condoIds => {
                    return condoIds == null ? [] : condoIds;
                })
                .catch(err => {
                    return [];
                });
            }
            return [];
        });
    }

    public listClusteringCondo(condoId: string, feedType: string): Promise<string[]> {
        return this.getListClusterByCondo(condoId, feedType)
        .then(clusterIds => {
            return this.getListCondoByListClusters(clusterIds);
        });
    }
}

export default ClusteringService;
