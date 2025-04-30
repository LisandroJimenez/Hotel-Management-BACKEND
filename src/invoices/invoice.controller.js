import Invoice from './invoice.model.js';

export const generateInvoice = async (req, res) => {
    try {

        const { services = [] } = req.body;
        const { reservation, room, hotel, days } = req;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;

        const servicesTotal = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

        const total = roomTotal + servicesTotal;

        const invoice = new Invoice({
            reservation: reservation._id,
            user: reservation.user._id,
            hotel: hotel._id,
            room: room._id,
            services,
            total,
            statusInvoice: 'PENDING'
        })

        await invoice.save();

        res.status(201).json({
            success: true,
            msg: 'Invoice generated successfully',
            invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error generating invoice',
            error: error.message
        })
    }
}

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