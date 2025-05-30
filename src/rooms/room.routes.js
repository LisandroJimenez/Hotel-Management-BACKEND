import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRole } from '../middlewares/validate-role.js';
import { validateHotel } from '../middlewares/validate-hotel.js';
import { validateRoom } from '../middlewares/validate-room.js';
import { createRoom, getRooms, searchRoom, updateRoom, deleteRoom, roomsAvailable } from './room.controller.js';

const router = Router();

router.post(
    '/',
    [
        validateJWT,
        validateHotel,
        hasRole('ADMIN_ROLE')
    ],
    createRoom
)

router.get(
    '/getRooms',
    getRooms
)

router.get('/availableRooms', roomsAvailable)

router.get(
    '/:id',
    [

        check('id', 'Invalid ID').isMongoId(),
        validateRoom
    ],
    searchRoom
)

router.put(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid ID').isMongoId(),
        hasRole('ADMIN_ROLE'),
        validateRoom
    ],
    updateRoom
)

router.delete(
    '/:id',
    [
        validateJWT,
        check('id', 'Invalid ID').isMongoId(),
        hasRole('ADMIN_ROLE')
    ],
    deleteRoom
)


export default router;