import User from "../users/user.model.js";
import Room from "../rooms/room.model.js";
import Service from "../Services/services.model.js"
import Reservation from "./reservation.model.js"

export const saveReservation = async (req, res) => {
    try {
        const { room, user, services = [], ...data } = req.body;

        // Validar que la habitación existe
        const roomDoc = await Room.findById(room);
        if (!roomDoc) {
            return res.status(404).json({
                success: false,
                msg: 'Room not found'
            });
        }

        // Validar que el usuario existe
        const userDoc = await User.findById(user);
        if (!userDoc) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Validar servicios si se proporcionan
        let serviceIds = [];
        if (services && Array.isArray(services) && services.length > 0) {
            // Extraer los IDs de los servicios del array de objetos o strings
            serviceIds = services.map(service => {
                if (typeof service === 'object' && service.service) {
                    return service.service;
                } else if (typeof service === 'string') {
                    return service;
                }
                return null;
            }).filter(id => id !== null);

            // Validar los servicios (solo los distintos)
            const uniqueServiceIds = [...new Set(serviceIds)];

            const servicesDocs = await Service.find({ _id: { $in: uniqueServiceIds } });
            if (servicesDocs.length !== uniqueServiceIds.length) {
                return res.status(404).json({
                    success: false,
                    msg: 'One or more services not found'
                });
            }
        }

        // Crear la reservación
        const reservation = new Reservation({
            ...data,
            room,
            user,
            services: serviceIds // ← se guardan tal cual, incluso si hay repetidos
        });

        await reservation.save();

        // Poblar la reservación para la respuesta
        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('room')
            .populate('user')
            .populate('services');

        res.status(200).json({
            success: true,
            msg: 'Reservation added successfully',
            reservation: populatedReservation
        });

    } catch (error) {
        console.error('Error saving reservation:', error);
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
            .populate({ path: 'room', select: 'numberRoom images' })
            .populate({ path: 'user', select: 'email' })
            .populate({ path: 'services', select: 'name price' });

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
        const { _id, room, user, service, ...data } = req.body;

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
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            0,
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

export const getMyReservations = async (req, res) => {
    const { limit, desde } = req.query;
    const userId = req.usuario._id;
    const isAdmin = req.usuario.role === 'ADMIN_ROLE';
    const query = { status: true };
    if (!isAdmin) {
        query.user = userId;
    }

    try {
        const reservations = await Reservation.find(query)
            .skip(Number(desde))
            .limit(Number(limit))
            .populate({ path: 'room', select: 'numberRoom images' })
            .populate({ path: 'user', select: 'email' })
            .populate({ path: 'services', select: 'name price' });

        const total = await Reservation.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            reservations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error getting reservations",
            error
        });
    }
};
