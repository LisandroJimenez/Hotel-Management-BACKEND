import User from "../users/user.model.js";
import Room from "../rooms/room.model.js";
import Reservation from "./reservation.model.js"

export const saveReservation = async (req, res) => {
    try {
        const { room, user, ...data } = req.body;

        const roomDoc = await Room.findById(room);
        if (!roomDoc) {
            return res.status(404).json({
                success: false,
                msg: 'Room not found'
            });
        }

        const userDoc = await User.findById(user);
        if (!userDoc) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        const reservation = new Reservation({
            ...data,
            room,
            user
        });

        await reservation.save();

        res.status(200).json({
            success: true,
            msg: 'Reservation added successfully',
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error saving reservation',
            error: error.message
        });
    }
};


export const getReservation = async (req, res) => {
    const { limit = 10, desde = 0 } = req.query;
    const query = { status: true };

    try {
        const reservations = await Reservation.find(query)
            .skip(Number(desde))
            .limit(Number(limit))
            .populate({path: 'room', select: 'numberRoom images'})
            .populate({ path: 'user', select: 'email' }); 

        const total = await Reservation.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            reservations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error getting reservation",
            error
        });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByIdAndUpdate(id, { status: false }, { new: true });
        if (!reservation) {
            return res.status(404).json({
                success: false,
                msg: "Reservation not found"
            });
        }
        res.status(200).json({
            success: true,
            msg: 'Reservation disabled',
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deactivating reservation',
            error
        })
    }
}

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, room, user, ...data } = req.body;

        if (room) {
            const roomExists = await Room.findById(room);
            if (!roomExists) {
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid room ID'
                });
            }
            data.room = room;
        }

        if (user) {
            const userExists = await User.findById(user);
            if (!userExists) {
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid user ID'
                });
            }
            data.user = user;
        }

        const reservation = await Reservation.findByIdAndUpdate(id, data, { new: true });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                msg: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Reservation updated successfully',
            reservation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating reservation',
            error: error.message || error
        });
    }
};