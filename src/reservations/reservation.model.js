import { Schema, model } from "mongoose";

const reservationSchema = Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    initDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required:false
    }],
    status: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default model('Reservation', reservationSchema);