import { response } from "express";
import { hash } from 'argon2';
import User from "./user.model.js";

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true }
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        })
    }
}
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, email, ...data } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        if (password) {
            user.password = await hash(password);
        }
        if (email) {
            user.email = email;
        }

        Object.assign(user, data);

        const updateUser = await user.save();

        res.status(200).json({
            success: true,
            msg: "User update successfully!",
            user: updateUser
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error when updating user',
            error
        });
    }
};



export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(id, { status: false }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            msg: 'User disabled',
            user,
            authenticatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deactivating user',
            error
        });
    }
};

export const getUsuariosPorMes = async (req, res) => {
    try {
        const resultado = await User.aggregate([
            {
                $match: { status: true }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalUsuarios: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            msg: 'Usuarios registrados por mes obtenidos',
            Usuarios: resultado
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Error en usuarios', error: error.message });
    }
};


export const getUserProfile = (req, res) => {
    try {
        const user = req.usuario;
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el perfil del usuario"
        })
    }
}