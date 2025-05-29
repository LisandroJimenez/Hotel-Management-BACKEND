import Invoice from './invoice.model.js';
import Services from '../Services/services.model.js';

export const generateInvoice = async (req, res) => {
    try {
        const { serviceIds = [] } = req.body; // ← ahora son solo IDs
        const { reservation, room, hotel, days } = req;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;

        // Buscar los servicios reales desde la BD
        const services = await Services.find({ _id: { $in: serviceIds }, status: true });

        const servicesTotal = services.reduce((sum, service) => sum + parseFloat(service.price.toString()), 0);
        const total = roomTotal + servicesTotal;

        const invoice = new Invoice({
            reservation: reservation._id,
            user: reservation.user._id,
            hotel: hotel._id,
            room: room._id,
            services,
            total,
            statusInvoice: 'PENDING'
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            msg: 'Invoice generated successfully',
            invoice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error generating invoice',
            error: error.message
        });
    }
};


export const paidInvoice = async (req, res) => {
    try {

        const { invoice } = req;
        invoice.statusInvoice = 'PAID';

        await invoice.save();

        res.status(200).json({
            success: true,
            msg: 'Invoice marked as PAID successfully',
            invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error change invoice status',
            error: error.message
        })
    }
}

export const getInvoices = async (req, res) => {
    try {

        const { userId, statusInvoice } = req.query; // Filtros opcionales

        const filter = {};
        if (userId) filter.user = userId;
        if (statusInvoice) filter.statusInvoice = statusInvoice;

        const invoices = await Invoice.find(filter)
            .populate('reservation', 'initDate endDate')
            .populate('user', 'name email')
            .populate('hotel', 'name')
            .populate('room', 'name price')

        const total = invoices.length;

        res.status(200).json({
            success: true,
            msg: 'Invoices get successfully',
            total,
            invoices

        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting invoices',
            error: error.message
        })
    }
}


export const getTotalIncome = async (req, res) => {
    try {
        const filter = { status: true, statusInvoice: 'PAID' };

        const invoices = await Invoice.find(filter).select('total');

        const totalIncome = invoices.reduce((sum, invoice) => {
            return sum + parseFloat(invoice.total.toString());
        }, 0);

        res.status(200).json({
            success: true,
            msg: 'Total income calculated successfully',
            totalIncome
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error calculating total income',
            error: error.message
        });
    }
};

export const getMontlyIncome = async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

        const monthlyIncome = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                    status: true,
                    statusInvoice: 'PAID'
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$total" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const fullYearIncome = Array(12).fill(0);
        monthlyIncome.forEach(entry => {
            fullYearIncome[entry._id - 1] = parseFloat(entry.total.toString());
        });

        res.status(200).json({
            success: true,
            message: "Ingresos por mes del año actual",
            incomePerMonth: fullYearIncome
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error obteniendo ingresos por mes",
            error: error.message
        });
    }
};