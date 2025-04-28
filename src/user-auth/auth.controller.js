import User from '../users/user.model.js';
import { hash , verify } from 'argon2';
import { generateJWT } from "../helpers/generate-jwt.js"

export const login = async (req, res) => {
    const {email, password, username} = req.body;
    try {
        const user = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        })
        if (!user) {
            return res.status(400).json({
                msg: 'Incorrect credentials, email does not exist in the database'
            })
        }
        if (!user.status) {
            return res.status(400).json({
                msg: 'The user does not exist in the database'
            })
        }

        const validPassword = await verify(user.password, password)
        if (!validPassword) {
            return res.status(400).json({
                msg: 'Password is incorrect'
            })
        }

        const token = await generateJWT(user.id)

        res.status(200).json({
            msg: 'Successful login',
            userDetails: {
                username: user.username,
                token : token
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Contact the administrator",
            error: e.message
        })
    }
}



export const register = async (req, res) =>{
    try {
        const data = req.body;

        const encryptedPassword = await hash(data.password);
        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            phone: data.phone,
            password: encryptedPassword,
            role: data.role
        })
        return res.status(200).json({
            message: "User registered successfully",
            userDetails: {
                user: user.email
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "User registration failed",
            error: error.message
        })
    }

}