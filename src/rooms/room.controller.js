import Room from '../rooms/room.model.js';
import Hotel from '../hotels/hotel.model.js';

export const createRoom = async (req, res) => {
    try {

        const data = req.body;

        const room = new Room({
            ...data
        })

        await room.save();

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            room
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating room',
            error: error.message
        })
    }
}

export const getRooms = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;
    const query = { status: true };

    try {

        const rooms = await Room.find(query)
            .skip(Number(offset))
            .limit(Number(limit))

        const roomsWithHotels = await Promise.all(rooms.map(async (room) => {
            const hotel = await Hotel.findById(room.hotel);
            return {
                ...room.toObject(),
                hotel: hotel ? { id: hotel._id, name: hotel.name } : 'Data not found'
            }
        }))

        const total = await Room.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            rooms: roomsWithHotels
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting rooms',
            error: error.message
        })
    }
}

export const searchRoom = async (req, res) => {
    try {

        const room = req.room;
        const hotel = await Hotel.findById(room.hotel);

        return res.status(200).json({
            success: true,
            room: {
                ...room.toObject(),
                hotel: hotel ? { id: hotel._id, name: hotel.name } : 'Data not found'
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error searching room',
            error: error.message
        })
    }
}

export const updateRoom = async (req, res) => {
    try {

        const { id } = req.params;
        const { _id, ...data } = req.body;

        const updatedRoom = await Room.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            room: updatedRoom
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating room',
            error: error.message
        })
    }
}

export const deleteRoom = async (req, res) => {

    const { id } = req.params;

    try {

        await Room.findByIdAndUpdate(id, { status: false });

        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message
        })
    }
}

export const roomsAvailable = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;
    const query = { status: true, statusRoom: 'AVAILABLE' };

    try {

        const [total, rooms] = await Promise.all([
            Room.countDocuments(query),
            Room.find(query)
                .populate('hotel', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ])

        return res.status(200).json({
            success: true,
            total,
            rooms
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting available rooms',
            error: error.message
        })
    }
}

export const getARoomCount = async (req, res) => {
    try {
        const count = await Room.countDocuments({ status: true, statusRoom: 'AVAILABLE' });

        return res.status(200).json({
            success: true,
            message: 'Cantidad de habitaciones disponibles obtenida exitosamente',
            availableRooms: count
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la cantidad de habitaciones disponibles',
            error: error.message
        });
    }
};