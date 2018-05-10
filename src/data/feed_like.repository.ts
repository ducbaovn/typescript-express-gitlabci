/**
 * Created by davidho on 4/17/17.
 */

import {BaseRepository} from "./base.repository";
import {FeedLikeDto} from "./sql/models";
import {FeedLikeModel} from "../models";

export class FeedLikeRepository extends BaseRepository<FeedLikeDto, FeedLikeModel> {
    constructor() {
        super(FeedLikeDto, FeedLikeModel, {
            fromDto: FeedLikeModel.fromDto,
            toDto: FeedLikeModel.toDto,
        });
    }

}
export  default FeedLikeRepository;
