/**
 * Created by ducbaovn on 27/07/17.
 */

import {BaseRepository} from "./base.repository";
import {EmailDto} from "./sql/models";
import {EmailModel} from "../models";
import * as Schema from "../data/sql/schema";
import * as Promise from "bluebird";
import {DELETE_STATUS, ENABLE_STATUS} from "../libs/constants";

export class EmailRepository extends BaseRepository<EmailDto, EmailModel> {
    constructor() {
        super(EmailDto, EmailModel, {
            fromDto: EmailModel.fromDto,
            toDto: EmailModel.toDto,
        });
    }
}
export default EmailRepository;
