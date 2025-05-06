import Services from './services.model.js';

export const createService = async (req, res) => {
    try {
        const { name, price, status } = req.body;

        const service = new Services({
            name,
            price,
            status
        });

        await service.save();

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message
        });
    }
};

export const getServices = async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;

    try {
        const services = await Services.find()
            .skip(Number(offset))
            .limit(Number(limit));

        const total = await Services.countDocuments();

        res.status(200).json({
            success: true,
            total,
            services
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting services',
            error: error.message
        });
    }
};

export const getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Services.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving service',
            error: error.message
        });
    }
};

export const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price, status } = req.body;

    try {
        const updatedService = await Services.findByIdAndUpdate(id, { name, price, status }, { new: true });

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service: updatedService
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

export const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Services.findByIdAndUpdate(id, { status: false });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        });
    }
};
