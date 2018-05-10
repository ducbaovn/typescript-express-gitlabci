/**
 * Created by davidho on 2/12/17.
 */

import {WhatOnHandler} from "./what_on.handler";
import * as express from "express";
const router = express.Router();
import {isAuthenticated, hasPrivilege, hasCache} from "../../../../middlewares";
import {ROLE} from "../../../../libs/constants";

router.route("/archive/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), WhatOnHandler.archive);

router.route("/read/:id")
    .put(isAuthenticated, hasPrivilege([ROLE.OWNER, ROLE.TENANT]), WhatOnHandler.read);

router.route("/:id")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), hasCache(), WhatOnHandler.view)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), WhatOnHandler.edit)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), WhatOnHandler.remove);

router.route("/")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.OWNER, ROLE.TENANT]), WhatOnHandler.list)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), WhatOnHandler.create);

export default router;
