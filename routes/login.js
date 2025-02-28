import crypto from 'crypto';        // used for md5 hash for password storing
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { Users } from '../database/database.js';    // used to access Users table from our MySQL database
import { logHttpRequest } from '../logger.js';

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

export default loginRouter;