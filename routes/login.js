import crypto from 'crypto';        // used for md5 hash for password storing
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { Users } from '../database/database.js';    // used to access Users table from our MySQL database
import { logHttpRequest } from '../logger.js';

// Google Login Imports
import { OAuth2Client } from 'google-auth-library'; // Importar la librería de Google
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Inicializar el cliente de Google


const loginRouter = Router();

// manages incoming login requests
loginRouter.post("/", async (req, res) => {
    // get username and password
    const { username, password } = req.body;

    // if any is missing, send "400 - Bad Request"
    if (!username || !password) {
        logHttpRequest(req, 400);
        return res.status(400).send(JSON.stringify({ message: "Bad Request. Expected username and password." }));
    }

    const user = await Users.checkUsernameExists(username);
    
    // if there's no user with that username, send "401 - Unauthorized"
    if (!user) {
        logHttpRequest(req, 401);
        return res.status(401).send();
    }
    
    const hashed_password = crypto.createHash('md5').update(password + process.env.PASSWORD_SALT).digest('hex');

    // Password is not correct, send "401 - Unauthorized"
    if (hashed_password !== user.user_password) {
        logHttpRequest(req, 401);
        return res.status(401).send();
    }

    // Generate the JWT Access token
    const JWTAccessToken = jwt.sign(user, process.env.JWT_SECRET_TOKEN, { expiresIn: "1d" });

    // Send JWT access token to client in the 'Authorization' header
    logHttpRequest(req, 200, user.user_id);
    return res.setHeader('Authorization', `Bearer ${JWTAccessToken}`).send();
});

loginRouter.get('/google-client-id', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID; // Leer el Client ID desde .env
    if (!clientId) {
        return res.status(500).json({ error: 'Google Client ID no configurado' });
    }
    res.json({ client_id: clientId }); // Enviar el Client ID como respuesta JSON
});

// Ruta para manejar el login con Google
loginRouter.post('/google', async (req, res) => {
    const { token } = req.body; // Obtener el token enviado desde el frontend

    if (!token) {
        logHttpRequest(req, 400);
        return res.status(400).json({ message: 'Token de Google no proporcionado' });
    }

    try {
        // Verificar el token de Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Verificar que el token pertenece a tu aplicación
        });

        const payload = ticket.getPayload(); // Obtener los datos del usuario desde el token
        const userId = payload.sub; // ID único del usuario en Google
        const username = payload.email; //username = google email (when creating a new user, then can be changed)
        const email = payload.email; // Correo electrónico del usuario
        const firstName = payload.name; // Nombre del usuario
        const lastName = payload.family_name; // Apellido del usuario

        // Buscar al usuario en la base de datos
        let user = await Users.getUserProfile(userId);

        // Si el usuario no existe, crearlo
        if (!user) {
            Users.createNewUserGoogle(userId, firstName, lastName, email, username);
            user = await Users.getUserProfile(userId); 
        }
        
        // Generar un token JWT para el usuario
        const JWTAccessToken = jwt.sign(user, // Datos que incluirás en el token
            process.env.JWT_SECRET_TOKEN,
            { expiresIn: '1d' } // El token expira en 1 día
        );

        logHttpRequest(req, 200, user.user_id);
        return res.status(200).json({ jwt: JWTAccessToken }); // Enviar el token al frontend
    } catch (error) {
        logHttpRequest(req, 401);
        console.error('Error al verificar el token de Google:', error);
        return res.status(401).json({ message: 'Token de Google inválido' });
    }
});

export default loginRouter;