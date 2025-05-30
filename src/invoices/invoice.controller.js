import Invoice from './invoice.model.js';
import Services from '../Services/services.model.js';
import mongoose from 'mongoose';

export const generateInvoice = async (req, res) => {
    try {
        const { reservation, room, hotel, days } = req;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;

        // Los servicios en bruto (IDs con repeticiones)
        const rawServiceIds = reservation.services.map(id => id.toString());

        // Contar cuántas veces se repite cada servicio
        const serviceCountMap = {};
        for (const id of rawServiceIds) {
            serviceCountMap[id] = (serviceCountMap[id] || 0) + 1;
        }

        // Cargar los servicios únicos desde la base
        const uniqueIds = Object.keys(serviceCountMap);
        const serviceDocs = await Services.find({ _id: { $in: uniqueIds } });

        // Calcular el total con repeticiones
        let servicesTotal = 0;
        for (const service of serviceDocs) {
            const count = serviceCountMap[service._id.toString()];
            servicesTotal += parseFloat(service.price.toString()) * count;
        }

        const total = roomTotal + servicesTotal;

        const invoice = new Invoice({
            reservation: reservation._id,
            user: reservation.user._id,
            hotel: hotel._id,
            room: room._id,
            services: rawServiceIds, // mantiene los repetidos si lo necesitas
            total,
            statusInvoice: 'PENDING'
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            msg: 'Factura generada correctamente',
            invoice
        });

    } catch (error) {
        console.error('Error al generar la factura:', error);
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