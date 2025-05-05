import { Schema, model } from "mongoose";

const eventSchema = Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'room',
        required: true
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'La fecha del evento debe ser futura.'
        }
    },
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

export default model('Event', eventSchema);