import Hotel from "./hotel.model.js";
import Room from "../rooms/room.model.js";
import Reservation from "../reservations/reservation.model.js"

export const saveHotel = async (req, res) => {
    try {
        const data = req.body;
        const images = req.files ? req.files.map(file => `/uploads/hotels/${file.filename}`) : [];

        const hotel = new Hotel({
            ...data,
            images
        });

        await hotel.save();

        res.status(200).json({
            success: true,
            msg: "Hotel added successfully",
            hotel
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error saving hotel"
        });
    }
};


export const getHotel = async (req, res) => {
    try {
        const { limite, desde, name, category, address } = req.query;

        const filters = { status: true };

        if (name) {
            filters.name = { $regex: name, $options: "i" };
        }

        if (category) {
            filters.category = { $regex: category, $options: "i" };
        }

        if (address) {
            filters.address = { $regex: address, $options: "i" };
        }

        const [total, hotels] = await Promise.all([
            Hotel.countDocuments(filters),
            Hotel.find(filters)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        const hotelsWithRooms = await Promise.all(
            hotels.map(async (hotel) => {
                const rooms = await Room.find({ hotel: hotel._id, status: true })
                    .select('numberRoom capacity price images status');

                return {
                    ...hotel.toObject(),
                    rooms
                };
            })
        );

        return res.status(200).json({
            success: true,
            msg: "Hotels found successfully",
            total,
            hotels: hotelsWithRooms
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error getting hotels",
            error: error.message || error
        });
    }
};



export const updateHotel = async (req, res) => { 
    try {
        const { id } = req.params;
        const { _id, ...restOfBody } = req.body; 
        const hotelToUpdate = await Hotel.findById(id);

        if (!hotelToUpdate) {
            return res.status(404).json({
                success: false,
                msg: "Hotel no encontrado"
            });
        }

        const updateFields = { ...restOfBody }; 

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/hotels/${file.filename}`);

            updateFields.images = newImageUrls;
        }
     
        const updatedHotel = await Hotel.findByIdAndUpdate(id, updateFields, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Hotel actualizado correctamente',
            hotel: updatedHotel 
        });

    } catch (error) {
        console.error("Error al actualizar hotel:", error); 
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar hotel',
            error: error.message || error
        });
    }
}
export const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findByIdAndUpdate(id, { status: false }, { new: true });
        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hotel not found"
            });
        }
        res.status(200).json({
            success: true,
            msg: 'Hotel disabled',
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deactivating hotel',
            error
        })
    }
}

//
export const getHotelesMasReservados = async (req, res) => {
    try {
        const agregacion = await Reservation.aggregate([
            { $match: { status: true } },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room',
                    foreignField: '_id',
                    as: 'roomData'
                }
            },
            { $unwind: '$roomData' },
            {
                $group: {
                    _id: '$roomData.hotel',
                    totalReservas: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            { $sort: { totalReservas: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            msg: 'Hoteles más reservados obtenidos',
            MoreReservation: agregacion
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Error en estadística', error: error.message });
    }
};

export const getHotelById = async (req, res) => { 
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id).lean(); 

        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hotel no encontrado."
            });
        }

        const rooms = await Room.find({ hotel: id }) 
            .select('numberRoom capacity price images status amenities');
        const hotelWithRooms = {
            ...hotel,
            rooms
        };

        return res.status(200).json({
            success: true,
            msg: "Hotel encontrado exitosamente",
            hotel: hotelWithRooms 
        });

    } catch (error) {
        console.error("Error en getHotelById del controlador de hoteles:", error);
        return res.status(500).json({
            success: false,
            msg: "Error interno del servidor al obtener los detalles del hotel.",
            error: error.message || error
        });
    }
};