import Event from './event.model.js'
import Room from '../rooms/room.model.js'

// Crear evento
export const saveEvent = async (req, res) => {
    try {
        const { room, date } = req.body;

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

        const eventDate = new Date(date);
        if (eventDate < new Date()) {
            return res.status(400).json({
                success: false,
                msg: "La fecha del evento debe ser futura"
            });
        }

        const existingEvent = await Event.findOne({ 
            room: room, 
            date: { $gte: eventDate, $lt: new Date(eventDate.getTime() + 60 * 60 * 1000) } // Verifica si hay un evento en la misma hora
        });

        if (existingEvent) {
            return res.status(400).json({
                success: false,
                msg: "Ya existe un evento en esta sala para la misma fecha"
            });
        }

        const event = new Event({ room, date: eventDate });
        await event.save();

        return res.status(200).json({
            success: true,
            msg: "Evento creado correctamente",
            event
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al guardar el evento",
            error
        });
    }
};

export const getEvents = async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    const query = { status: true}

    try{
        const events = await Event.find(query)
        .skip(Number(offset))
        .limit(Number(limit))

        const eventWithRooms = await Promise.all(events.map(async (event) => {
            const room = await Room.findById(event.room);
            return {
                ...event.toObject(),
                room: room ? { id: room.id, description: room.description} : 'Data not found'
            }
        }))

        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            events: eventWithRooms
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            msg: 'Error getting events',
            error: error.msg
        })
    }
}

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true});

        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            event: updatedEvent
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            msg: 'Error updating event',
            error: error.msg
        })
    }
}

