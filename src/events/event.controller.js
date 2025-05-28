import Event from './event.model.js'
import Hotel from '../hotels/hotel.model.js';
import Room from '../rooms/room.model.js';

export const saveEvent = async (req, res) => {
    try {
        const data = req.body;

        console.log(data);


        const event = new Event({ ...data });
        await event.save();

        const hotel = await Hotel.findById(event.hotel);
        const room = await Room.findById(event.room);

        const eventWithDetails = {
            ...event.toObject(),
            hotel: hotel
                ? { HotelId: hotel._id, HotelName: hotel.name }
                : 'Data not found',
            room: room
                ? { RoomId: room._id, NumberRoom: room.numberRoom }
                : 'Data not found',
            date: event.date.toISOString().split('T')[0]
        };

        return res.status(200).json({
            success: true,
            msg: "Evento creado correctamente",
            event: eventWithDetails
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
    const query = { status: true }

    try {
        const events = await Event.find(query)
            .skip(Number(offset))
            .limit(Number(limit))

        const eventWithHotel = await Promise.all(events.map(async (event) => {
            const hotel = await Hotel.findById(event.hotel);
            const room = await Room.findById(event.room);
            return {
                ...event.toObject(),
                hotel: hotel ? { HotelName: hotel.name, _id: hotel._id } : 'Data not found',
                room: room ? { NumberRoom: room.numberRoom, _id: room._id } : 'Data not found'
            }
        }))

        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            hotel: eventWithHotel
        })
    } catch (error) {
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
        const { ...data } = req.body;

        console.log('ID: ', id, " Data: ", data);


        const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true });

        console.log('si llego');


        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            event: updatedEvent
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: 'Error updating event',
            error: error.msg
        })
    }
}

export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        await Event.findByIdAndUpdate(id, { status: false });
        return res.status(200).json({
            success: true,
            msg: 'Event deleted successfully'
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message
        })
    }
}

