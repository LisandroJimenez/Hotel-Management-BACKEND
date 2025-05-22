import Hotel from "./hotel.model.js";
import Room from "../rooms/room.model.js";
import Reservation from "../reservations/reservation.model.js"

export const saveHotel = async (req, res) => {
    try {
        const data = req.body;

        const hotel = new Hotel({
            ...data
        });

        await hotel.save();

        res.status(200).json({
            success: true,
            msg: "Hotel added successfully",
            hotel
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error saving hotel"
        })

    }
}

export const getHotel = async (req, res) => {
    try {
        const { limite = 10, desde = 0, name, category, address } = req.query;

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
                const rooms = await Room.find({ hotel: hotel._id })
                    .select('numberRoom capacity price images');

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


export const updateHotel = async (req, res = response) => {
    try {

        const { id } = req.params;
        const { _id, ...data } = req.body;

        const hotel = await Hotel.findByIdAndUpdate(id, data, { new: true });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Updating hotel',
            hotel
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating hotel',
            error: error.message
        })
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

        const hotel = await Hotel.findById(id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hotel not found with the provided ID."
            });
        }

        const rooms = await Room.find({ hotel: hotel._id })
            .select('numberRoom capacity price images');

        const hotelWithRooms = {
            ...hotel.toObject(),
            rooms
        };

        res.status(200).json({
            success: true,
            msg: "Hotel details fetched successfully",
            hotel: hotelWithRooms
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                msg: "Invalid Hotel ID format."
            });
        }
        return res.status(500).json({
            success: false,
            msg: "Error fetching hotel details from the server.",
            error: error.message
        });
    }
};