import { Router } from "express";
import { check } from "express-validator";
import { deleteUser, getUsers, updateUser } from "./user.controller.js";
import { getUsuariosPorMes } from "./user.controller.js";
import { existUserById } from "../helpers/db-validator.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateOwner, validateEmail, validateRole } from "../middlewares/validate-user.js";

const router = Router()

router.get("/", getUsers)

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existUserById),
        validateRole,
        validateEmail,
        validateFields
    ],
    updateUser

)

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existUserById),
        validateOwner,
        validateFields
    ],
    deleteUser
)

router.get("/forMonth", getUsuariosPorMes)

export default router;