import * as express from "express";
import { ROLE, FUNCTION_PASSWORD_TYPE } from "../../../../libs/constants";
import { isAuthenticated, hasPrivilege, hasCache, passwordAuth } from "../../../../middlewares";
import { FacilityHandler } from "./facilities.handler";
const router = express.Router();

router.route("/types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getFacilityTypes);

router.route("/slot-types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getSlotTypes);

router.route("/slot-time-types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getBookingSlotTimeTypes);

router.route("/duration-types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getSlotDurationTypes);

router.route("/restriction-types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getSlotRestrictionTypes);

router.route("/special-price-types")
    .get(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), hasCache(), FacilityHandler.getBookingSpecialPriceTypes);

router.route("/suspensions")
    .get(isAuthenticated, hasCache(), FacilityHandler.listSuspension);

router.route("/:id/slots/sections/available")
    .get(isAuthenticated, FacilityHandler.checkAvailableSession);

router.route("/:id/slots/:slotId/suspensions/:suspensionId")
    .get(isAuthenticated, FacilityHandler.getSuspension)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.MANAGER]), FacilityHandler.editSuspension)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER, ROLE.MANAGER]), FacilityHandler.removeSuspension);

router.route("/:id/slots/:slotId/suspensions")
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), passwordAuth(FUNCTION_PASSWORD_TYPE.BOOKING), FacilityHandler.createSuspension);

router.route("/:id/slots/:slotId")
    .get(isAuthenticated, hasCache(), FacilityHandler.getSlotDetail)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.updateSlot)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.deleteSlot);

router.route("/:id/slots")
    .get(isAuthenticated, hasCache(), FacilityHandler.getSlots)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.createSlot);

router.route("/:id/quotas")
    .get(isAuthenticated, hasCache(), FacilityHandler.getQuotas);

router.route("/:id/quotas/exempt")
    .get(isAuthenticated, hasCache(), FacilityHandler.checkQuotaExempt);

router.route("/:id")
    .get(isAuthenticated, hasCache(), FacilityHandler.getFacility)
    .put(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.updateFacility)
    .delete(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.deleteFacility);

router.route("/")
    .get(isAuthenticated, hasCache(), FacilityHandler.getFacilities)
    .post(isAuthenticated, hasPrivilege([ROLE.SYSTEM_ADMIN, ROLE.CONDO_MANAGER]), FacilityHandler.createFacilities);

export default router;
