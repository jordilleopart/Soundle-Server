import jwt from 'jsonwebtoken';

// WebSocket authentication middleware using async/await
async function authenticateWSJWTToken(ws, token) {
    // If no token, close connection with "Policy Violation" code
    if (!token) {
        ws.close(1008, JSON.stringify({ message: "Log in to see the content." }));
        return {
            user_id: undefined,
            user_name: undefined,
        };
    }

    try {
        // Verify JWT Token
        const user = await jwt.verify(token, process.env.JWT_SECRET_TOKEN);

        // If token is valid, return user info
        return {
            user_id: user.user_id,
            user_name: user.user_name,
        };
    } catch (err) {
        // If token is invalid, send "403 - Forbidden"
        ws.close(1008, JSON.stringify({ message: "Token expired. Please log in again." }));
        return {
            user_id: undefined,
            user_name: undefined,
        };
    }
}

export default authenticateWSJWTToken;