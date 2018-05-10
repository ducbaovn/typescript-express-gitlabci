/**
 * Created by davidho on 4/13/17.
 */

import {BaseRepository} from "./base.repository";
import {GarageSaleCategoryDto} from "./sql/models";
import {GarageSaleCategoryModel} from "../models";
import * as Promise from "bluebird";
import * as Schema from "../data/sql/schema";
export class GarageSaleCategoryRepository extends BaseRepository<GarageSaleCategoryDto, GarageSaleCategoryModel> {
    constructor() {
        super(GarageSaleCategoryDto, GarageSaleCategoryModel, {
            fromDto: GarageSaleCategoryModel.fromDto,
            toDto: GarageSaleCategoryModel.toDto,
        });
    }

}
export  default GarageSaleCategoryRepository;
