import Hotel from '../hotels/hotel.model.js';

export const validateHotel = async (req, res, next) => {

    const { hotel } = req.body;
    const existingHotel = await Hotel.findById(hotel);

    if (!existingHotel) {
        return res.status(404).json({
            success: false,
            message: 'Hotel not found'
        })
    }

    req.hotel = existingHotel;
    next();

}