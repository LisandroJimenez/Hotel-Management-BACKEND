import { Schema, model } from 'mongoose';

const InvoiceSchema = Schema({
    reservation: {
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: false
    }],
    total: {
        type: Schema.Types.Decimal128,
        required: true
    },
    statusInvoice: {
        type: String,
        enum: ['PAID', 'PENDING'],
        default: 'PENDING'
    },
    status: {
        type: Boolean,
        default: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)

export default model('Invoice', InvoiceSchema)