import { Router } from "express";
import { check } from 'express-validator';
import { saveEvent, getEvents, updateEvent, deleteEvent } from "./event.controller.js";
import { hasRole } from "../middlewares/validate-role.js";
import { validateJWT } from '../middlewares/validate-jwt.js';
import { validateRoom,validateEventDate,validateEventConflict, markRoomUnavailable } from '../middlewares/validate.event.js'


const router = Router()

router.post(
    "/",
    [
        validateJWT,
        hasRole('ADMIN_ROLE'),
        validateEventDate,
        validateEventConflict
    ],
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

router.delete(
    '/deleteEvent/:id',
    [
        validateJWT,
        check('id', 'Invalid ID').isMongoId(),
        hasRole('ADMIN_ROLE')
    ],
    deleteEvent
)

export default router;