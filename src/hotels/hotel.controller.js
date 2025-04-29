import Hotel from "./hotel.model.js";
import Room from "../rooms/room.model.js";

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
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, hotels] = await Promise.all([
            Hotel.countDocuments(query),
            Hotel.find(query)
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
            msg: "Hotel found successfully",
            total,
            hotels: hotelsWithRooms 
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error getting hotel"
        });
    }
}


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