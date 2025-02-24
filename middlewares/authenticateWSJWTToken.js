import jwt from 'jsonwebtoken';

// WebSocket authentication middleware
function authenticateWSJWTToken(req, ws, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // if no token, close connection with "Policy Violation" code
    if (!token) {
        ws.close(1008, JSON.stringify({ message: "Log in to see the content." }));
        return;
    }

    // Verify JWT Token
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        // If token is not valid, send "403 - Forbidden"
        if (err) {
            ws.close(1008, JSON.stringify({ message: "Token expired. Please log in again." }));
            return;
        }

        // Attach user to WebSocket instance for further use
        ws.user_name = user.user_name;

        // Proceed with the connection
        next();
    });
    next();
};


export default authenticateWSJWTToken;