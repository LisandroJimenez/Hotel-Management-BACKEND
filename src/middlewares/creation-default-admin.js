import argon2 from "argon2";
import User from '../users/user.model.js'

export const createAdmin = async () => {
    try {
        const existAdmin = await User.findOne({ role: "ADMIN_ROLE" });
        
        if (!existAdmin) {
            const hashed = await argon2.hash("12345678");
            const adminUser = new User({
                name: "Admin",
                surname: "Admin",
                username: "admin",
                email: "admin@gmail.com",
                phone: "12345667",
                password: hashed,
                role: "ADMIN_ROLE"
            });

            await adminUser.save();
        } 
    } catch (error) {
        console.error("Error creating admin:", error);
    }
};