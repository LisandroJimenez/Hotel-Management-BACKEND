import Invoice from './invoice.model.js';
import Services from '../Services/services.model.js';
import mongoose from 'mongoose';


export const generateInvoice = async (req, res) => {
    try {
        const { serviceIds = [] } = req.body;
        const { reservation, room, hotel, days } = req;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;

        // Paso 1: contar repeticiones
        const serviceCount = {};
        for (const id of serviceIds) {
            serviceCount[id] = (serviceCount[id] || 0) + 1;
        }

        // Paso 2: buscar los servicios únicos
        const uniqueServiceIds = [...new Set(serviceIds)];
        const foundServices = await Services.find({
            _id: { $in: uniqueServiceIds },
            status: true
        });

        // Paso 3: calcular total considerando repeticiones
        let servicesTotal = 0;
        for (const service of foundServices) {
            const count = serviceCount[service._id.toString()];
            servicesTotal += parseFloat(service.price.toString()) * count;
        }

        const total = roomTotal + servicesTotal;

        // Paso 4: repetir los ObjectId según la cantidad
        const expandedServices = [];
        for (const id of serviceIds) {
            expandedServices.push(new mongoose.Types.ObjectId(id));
        }

        const invoice = new Invoice({
            reservation: reservation._id,
            user: reservation.user._id,
            hotel: hotel._id,
            room: room._id,
            services: expandedServices,
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