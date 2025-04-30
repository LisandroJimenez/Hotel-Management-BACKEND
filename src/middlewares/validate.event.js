import Room from '../rooms/room.model.js';
import Event from '../events/event.model.js';

// Validar si la sala existe y está disponible
export const validateRoom = async (req, res, next) => {
    const { room } = req.body;

    try {
        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({
                success: false,
                msg: "La sala no existe"
            });
        }

        if (roomData.statusRoom !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                msg: "La sala no está disponible"
            });
        }

        req.roomData = roomData;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al validar la sala",
            error
        });
    }
};

export const validateEventDate = (req, res, next) => {
    const { date } = req.body;
    const eventDate = new Date(date);

    if (eventDate < new Date()) {
        return res.status(400).json({
            success: false,
            msg: "La fecha del evento debe ser futura"
        });
    }

    req.eventDate = eventDate;
    next();
};

export const validateEventConflict = async (req, res, next) => {
    const { room } = req.body;
    const eventDate = req.eventDate;

    try {
        const existingEvent = await Event.findOne({
            room,
            date: {
                $gte: eventDate,
                $lt: new Date(eventDate.getTime() + 60 * 60 * 1000)
            }
        });

        if (existingEvent) {
            return res.status(400).json({
                success: false,
                msg: "Ya existe un evento en esta sala para la misma fecha"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al verificar conflicto de eventos",
            error
        });
    }
};

export const markRoomUnavailable = async (req, res, next) => {
    const { room } = req.body;

    try {
        await Room.findByIdAndUpdate(room, { statusRoom: "UNAVAILABLE" });
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al cambiar el estado de la sala",
            error
        });
    }
};