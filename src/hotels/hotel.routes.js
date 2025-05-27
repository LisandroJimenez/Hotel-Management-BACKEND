import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields.js";
import { saveHotel, getHotel, deleteHotel, updateHotel, getHotelById } from "./hotel.controller.js";
import { getHotelesMasReservados } from "./hotel.controller.js";
import { existHotelById } from "../helpers/db-validator.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateAdmin } from "../middlewares/validate-user.js";

const router = Router()

router.post(
    "/",
    [
        validateJWT,
        validateAdmin,
        validateFields
    ],
    saveHotel
)

router.get("/", getHotel)

router.put(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existHotelById),
        validateFields
    ],
    updateHotel
)

router.delete(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existHotelById),
        validateFields
    ],
    deleteHotel
)

router.get("/moreR", getHotelesMasReservados)

router.get('/:id', getHotelById); 


export default router;