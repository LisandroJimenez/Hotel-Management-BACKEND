import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields.js";
import { saveHotel, getHotel, deleteHotel, updateHotel } from "./hotel.controller.js";
import { existHotelById } from "../helpers/db-validator.js";

const router = Router()

router.post(
    "/",
    [
        validateFields
    ],
    saveHotel
)

router.get("/", getHotel)

router.put(
    "/:id",
    [
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existHotelById),
        validateFields
    ],
    updateHotel
)

router.delete(
    "/:id",
    [
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existHotelById),
        validateFields
    ],
    deleteHotel
)

export default router;