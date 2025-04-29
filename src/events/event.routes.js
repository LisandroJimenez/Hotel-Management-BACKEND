import { Router } from "express";
import { saveEvent, getEvents } from "./event.controller.js";
import { hasRole } from "../middlewares/validate-role.js";


const router = Router()

router.post(
    "/",
    saveEvent
)

router.get(
    '/getEvent',
    getEvents
)

export default router;