import Invoice from './invoice.model.js';
import Services from '../Services/services.model.js';
import mongoose from 'mongoose';

export const generateInvoice = async (req, res) => {
    try {
        const { reservation, room, hotel, days } = req;

        const roomPrice = parseFloat(room.price.toString());
        const roomTotal = roomPrice * days;
        const rawServiceIds = reservation.services.map(id => id.toString());
        const serviceCountMap = {};
        for (const id of rawServiceIds) {
            serviceCountMap[id] = (serviceCountMap[id] || 0) + 1;
        }
        const uniqueIds = Object.keys(serviceCountMap);
        const serviceDocs = await Services.find({ _id: { $in: uniqueIds } });
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
            services: rawServiceIds, 
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
        const userId = req.usuario._id;
        const isAdmin = req.usuario.role === 'ADMIN_ROLE';
        const allInvoices = await Invoice.find()
            .populate({
                path: 'reservation',
                select: 'user initDate endDate',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('hotel', 'name')
            .populate('room', 'name price');

        let filteredInvoices = allInvoices;
        if (!isAdmin) {
            filteredInvoices = allInvoices.filter(invoice =>
                invoice.reservation?.user?._id?.toString() === userId.toString()
            );
        }

        res.status(200).json({
            success: true,
            msg: 'Invoices fetched successfully',
            total: filteredInvoices.length,
            invoices: filteredInvoices
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting invoices',
            error: error.message
        });
    }
};


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