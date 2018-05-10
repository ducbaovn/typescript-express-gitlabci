/**
 * Created by davidho on 4/17/17.
 */

import {BaseRepository} from "./base.repository";
import {FeedCommentLikeDto} from "./sql/models";
import {FeedCommentLikeModel} from "../models";

export class FeedCommentLikeRepository extends BaseRepository<FeedCommentLikeDto, FeedCommentLikeModel> {
    constructor() {
        super(FeedCommentLikeDto, FeedCommentLikeModel, {
            fromDto: FeedCommentLikeModel.fromDto,
            toDto: FeedCommentLikeModel.toDto,
        });
    }

}
export  default FeedCommentLikeRepository;
