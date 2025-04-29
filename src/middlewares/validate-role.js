export const hasRole = (...roles) => {
    return (req, res, next) => {
        if(!req.usuario){
            return res.status(500).json({
                success: false,
                msg: 'Role verification attempted without validating the token first'
            })
        }
        
        if (!roles.includes(req.usuario.role)){
            return res.status(401).json({
                success: false,
                msg: `User not authorized, current role is ${req.usuario.role}, allowed roles are ${roles}`
            })
        }

        next();
    }
}