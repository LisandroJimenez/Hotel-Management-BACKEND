import User from '../users/user.model.js'

export const validateOwner = async(req, res, next) => {
    const { id } = req.params;
    const authenticatedUser = req.usuario.id;
    const user = req.usuario.role;
    console.log("Authenticated user:", user);

    if (user != "ADMIN_ROLE" && authenticatedUser !== id) {
        return res.status(403).json({
            success: false,
            msg: "You can only desactivate your own account"
        });
    }
    next()
}

export const validateEmail = async(req, res, next) => {
    const { email } = req.body;
    const authenticatedUser = req.usuario.email;
    if (email != authenticatedUser) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                msg: 'Email is already in use by another user'
            });
        }
    }
    next()
}

export const validateRole = async(req, res, next) => {
    const { id } = req.params;
    const authenticatedUser = req.usuario.id;
    const role = req.usuario.role;
    if(role != "ADMIN_ROLE" && authenticatedUser != id){
        return res.status(400).json({
            success: false,
            msg: "You don't have an authorized for modified"
        })
    }
    next()
}