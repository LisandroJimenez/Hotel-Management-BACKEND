import { Schema, model } from "mongoose";

const eventSchema = Schema({
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'hotel',
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
    description:{
        type: String,
        required: true
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