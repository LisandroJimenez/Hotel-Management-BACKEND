import Role from "./role.model.js"

export const createRoles = async () => {
    try {
        const existRoles = await Role.find({ role: { $in: ["ADMIN_ROLE", "EMPLOYEE_ROLE"] } });

        if (existRoles.length < 2) {
            if (!existRoles.some(role => role.role === "ADMIN_ROLE")) {
                await new Role({ role: "ADMIN_ROLE" }).save();
            }
            if (!existRoles.some(role => role.role === "EMPLOYEE_ROLE")) {
                await new Role({ role: "EMPLOYEE_ROLE" }).save();
            }
        }
    } catch (error) {
        console.error("Error creating roles:", error);
    }
};
