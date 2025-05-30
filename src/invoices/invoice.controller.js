import Invoice from './invoice.model.js';
import Services from '../Services/services.model.js';
import mongoose from 'mongoose';

export const generateInvoice = async (req, res) => {
    try {
        const { reservation, room, hotel } = req;

        // Calcular días entre fechas
        const start = new Date(reservation.initDate);
        const end = new Date(reservation.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;

        // Cargar los servicios
        await reservation.populate('services');

        const servicesTotal = reservation.services.reduce(
            (sum, service) => sum + parseFloat(service.price.toString()), 
            0
        );

        const total = roomTotal + servicesTotal;

        const invoice = new Invoice({
            reservation: reservation._id,
            user: reservation.user._id,
            hotel: hotel._id,
            room: room._id,
            services: reservation.services.map(s => s._id),
            total: mongoose.Types.Decimal128.fromString(total.toFixed(2)), // ← aquí el cambio importante
            statusInvoice: 'PENDING'
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            msg: 'Factura generada correctamente',
            invoice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al generar la factura',
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