import Room from '../rooms/room.model.js';

export const validateRoom = async (req, res, next) => {

    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found'
        })
    }

    req.room = room;
    next();

}