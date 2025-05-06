import { Schema, model } from 'mongoose';

const Services = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: [100, 'Service name must be less than 100 characters'],
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true,
        min: [0, 'Price must be a positive number'],
    },
    status:{
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Services', Services);
