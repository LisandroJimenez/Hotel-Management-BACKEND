import { Schema, model } from 'mongoose';

const RoomSchema = Schema({
    numberRoom: {
        type: String,
        required: true,
        maxLength: [10, 'Number room must be less than 10 characters'],
    },
    typeRoom: {
        type: String,
        required: true,
        enum: ['SINGLE', 'DOUBLE', 'SUITE'],
    },
    capacity: {
        type: Number,
        required: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true,
        min: [0, 'Price must be a positive number']
    },
    statusRoom: {
        type: String,
        required: true,
        enum: ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'],
    },
    description: {
        type: String,
        required: true,
        maxLength: [200, 'Description must be less than 200 characters'],
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    availableFrom: {
        type: Date,
        required: true
    },
    images: {
        type: [String], 
        default: []
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)

export default model('Room', RoomSchema)