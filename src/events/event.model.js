import { Schema, model } from "mongoose";

const eventSchema = Schema({
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'hotel',
        required: true
    },
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
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ['Confirmado', 'Pendiente'],
        default: 'Pendiente'
    },
    type: {
        type: String,
        enum: ['Gala', 'Conferencia', 'Cultural'],
        required: true
    },
    attend: {
        type: Number,
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

eventSchema.pre('save', function(next) {
    if(!this.state || this.state.trim() === ''){
        this.state = 'Pendiente'
    }
    next();
})


export default model('Event', eventSchema);