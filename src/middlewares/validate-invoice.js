import Invoice from '../invoices/invoice.model.js';

export const validateInvoice = async (req, res, next) => {
    try {

        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: 'Invoice not found'
            })
        }

        req.invoice = invoice;

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error validating invoice',
            error: error.message
        })
    }
}