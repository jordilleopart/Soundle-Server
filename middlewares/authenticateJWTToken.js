import jwt from 'jsonwebtoken';
import { logHttpRequest } from '../logger.js';

function authenticateJWTToken(req, res, next) {
    // Retrieve JWT Token from the header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // if no token, send "401 - Unauthorized"
    if (!token) {
        logHttpRequest(req, 401);
        return res.status(401).send(JSON.stringify({ message: "Log in to see the content." }));
    }

    // verify JWT Token
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        // User has token but it is not valid, send "403 - Forbidden"
        if (err) {
            logHttpRequest(req, 403);
            return res.status(403).send(JSON.stringify({ message: "Token expired. Please log in again." }));
        }
        // Attach user to request object for further use
        req.user = user;
        // call next middleware
        next();
    })
}

export default authenticateJWTToken;