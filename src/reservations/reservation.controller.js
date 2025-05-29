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

        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('room')
            .populate('user');

        res.status(200).json({
            success: true,
            msg: 'Reservation added successfully',
            reservation: populatedReservation
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

export const ReservationsToday = async (req, res) => {
    try {
        const now = new Date();

        // Inicio del mes (día 1 a las 00:00:00)
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

        // Fin del mes (último día del mes a las 23:59:59.999)
        const endOfMonth = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1, // mes siguiente
            0, // día 0 del mes siguiente = último día del mes actual
            23, 59, 59, 999
        ));

        const count = await Reservation.countDocuments({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            },
            status: true
        });

        res.status(200).json({
            success: true,
            message: 'Cantidad de reservaciones hechas este mes',
            reservationsThisMonth: count
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo la cantidad de reservaciones este mes',
            error: error.message
        });
    }
};

export const getMonthlyStats = async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

        const monthlyReservations = await Reservation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                    status: true
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Inicializamos un array con 12 valores (uno por mes)
        const fullYearData = Array(12).fill(0);
        monthlyReservations.forEach(entry => {
            fullYearData[entry._id - 1] = entry.total;
        });

        res.status(200).json({
            success: true,
            message: "Reservaciones por mes del año actual",
            reservationsPerMonth: fullYearData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error obteniendo reservaciones por mes",
            error: error.message
        });
    }
};