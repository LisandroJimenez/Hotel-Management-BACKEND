import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields.js";
import { saveReservation, getReservation, deleteReservation, updateReservation, ReservationsToday,getMonthlyStats} from "./reservation.controller.js";
import { existReservationById } from "../helpers/db-validator.js";
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router()

router.post(
    "/",
    [
        validateJWT,
        validateFields
    ],
    saveReservation
)

router.get("/", getReservation)

router.get("/today", ReservationsToday)

router.get("/Stats", getMonthlyStats)

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existReservationById),
        validateFields
    ],
    updateReservation
)

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existReservationById),
        validateFields
    ],
    deleteReservation
)

export default router;