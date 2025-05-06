import {Schema, model} from 'mongoose'

const RoleSchema = Schema({
    role: {
        type: String,
        enum: ['ADMIN_ROLE', 'EMPLOYEE_ROLE'],
        required: [true, 'The role is required']
    }
});

export default model('Role', RoleSchema);