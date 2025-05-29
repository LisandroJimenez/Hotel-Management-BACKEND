'use strict';
import express from 'express'
import cors from 'cors'
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './mongo.js';
import limiter from '../src/middlewares/validate-cant-request.js';
import authRoutes from '../src/user-auth/auth.routes.js'
import userRoutes from '../src/users/user.routes.js'
import hotelRoutes from '../src/hotels/hotel.routes.js'
import roomRoutes from '../src/rooms/room.routes.js';
import reservationRoutes from '../src/reservations/reservation.routes.js'
import invoiceRoutes from '../src/invoices/invoice.routes.js';
import servicesRoutes from '../src/Services/services.routes.js'
import eventRoutes from '../src/events/event.routes.js';
import { createAdmin } from '../src/middlewares/creation-default-admin.js'
import { createRoles } from '../src/role/role.controller.js'
import path from 'path'

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
    // Modifica la configuración de Helmet aquí
    app.use(helmet({
        crossOriginEmbedderPolicy: false, // <-- Añade esta línea
        // También podrías necesitar esto si tienes problemas con las imágenes de perfil o similares
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));
    app.use(morgan('dev'));
    app.use(limiter); // Asegúrate de que esto sea un punto y coma, no una coma
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

const routes = (app) => {
    app.use('/HotelManagement/v1/auth', authRoutes);
    app.use('/HotelManagement/v1/user', userRoutes);
    app.use('/HotelManagement/v1/hotel', hotelRoutes);
    app.use('/HotelManagement/v1/room', roomRoutes);
    app.use('/HotelManagement/v1/services', servicesRoutes);
    app.use('/HotelManagement/v1/event', eventRoutes);
    app.use('/HotelManagement/v1/reservation', reservationRoutes);
    app.use('/HotelManagement/v1/invoice', invoiceRoutes);

}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log('Successful connection to the database')
    } catch (error) {
        console.log('Failed to connect to database')
    }
}

export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;
    try {
        middlewares(app);
        await conectarDB();
        routes(app);
        app.listen(port);
        await createAdmin();
        await createRoles();
        console.log(`server running on port ${port}`)

    } catch (err) {
        console.log(`server init failed: ${err}`)
    }

}