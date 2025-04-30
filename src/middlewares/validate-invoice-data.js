import Reservation from '../reservations/reservation.model.js';
import Room from '../rooms/room.model.js';
import Hotel from '../hotels/hotel.model.js';

export const validateInvoiceData = async (req, res, next) => {
    try {

        const { reservationId } = req.body;

        const reservation = await Reservation.findById(reservationId).populate('room user');
        if (!reservation) {
            return res.status(404).json({
                success: false,
                msg: 'Reservation not found'
            })
        }

        const room = await Room.findById(reservation.room);
        if (!room) {
            return res.status(404).json({
                success: false,
                msg: 'Room not found'
            })
        }

        const hotel = await Hotel.findById(room.hotel);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: 'Hotel not found'
            })
        }

        const startDate = new Date(reservation.initDate);
        const endDate = new Date(reservation.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Diferencia en días

        if (days <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid reservation dates'
            })
        }

        req.reservation = reservation;
        req.room = room;
        req.hotel = hotel;
        req.days = days;
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error validating invoice data',
            error: error.message
        })
    }
}