/**
 * Created by davidho on 1/12/17.
 */

import * as express from "express";
import { ClusteringHandler } from "./clustering.handler";
import { isAuthenticated, hasPrivilege, hasCache } from "../../../../middlewares";
import { ROLE } from "../../../../libs/constants";

const router = express.Router();

router.route("/:id/members/:memberId")
    .delete(ClusteringHandler.removeMember);

router.route("/:id/members")
    .put(ClusteringHandler.addMember);

router.route("/:id")
    .get(ClusteringHandler.get)
    .put(ClusteringHandler.edit)
    .delete(ClusteringHandler.remove);

router.route("/")
    .get(ClusteringHandler.list)
    .post(ClusteringHandler.add);

export default router;
