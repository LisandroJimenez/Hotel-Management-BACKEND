import Event from './event.model.js'
import Hotel from '../hotels/hotel.model.js';

// Crear evento
export const saveEvent = async (req, res) => {
    try {
        const data = req.body;

        const event = new Event({
            ...data
        })

        await event.save()

        return res.status(200).json({
            success: true,
            msg: "Evento creado correctamente",
            event: {
                ...event.toObject(),
                date: event.date.toISOString().split('T')[0] // solo YYYY-MM-DD
            }
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

        const eventWithHotel = await Promise.all(events.map(async (event) => {
            const hotel = await Hotel.findById(event.hotel);
            return {
                ...event.toObject(),
                hotel: hotel ? { HotelName: hotel.name} : 'Data not found'
            }
        }))

        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            hotel: eventWithHotel
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

export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try{
        await Event.findByIdAndUpdate(id, { status: false});
        return res.status(200).json({
            success: true,
            msg: 'Event deleted successfully'
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message
        })
    }
}

