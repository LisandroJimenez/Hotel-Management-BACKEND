import { Router } from "express";
import { check } from 'express-validator';
import { saveEvent, getEvents, updateEvent } from "./event.controller.js";
import { hasRole } from "../middlewares/validate-role.js";
import { validateJWT } from '../middlewares/validate-jwt.js';


const router = Router()

router.post(
    "/",
    saveEvent
)

router.get(
    '/getEvent',
    getEvents
)

router.put(
    '/updateEvent/:id',
    [
        validateJWT,
        check('id', 'Invalid ID').isMongoId(),
        hasRole('ADMIN_ROLE')
    ],
    updateEvent
)

export default router;