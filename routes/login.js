import crypto from 'crypto';        // used for md5 hash for password storing
import { Router } from 'express';
import { Users } from '../database/database.js';    // used to access Users table from our MySQL database

const loginRouter = Router();

// manages incoming login requests
loginRouter.post("/", async (req, res) => {
    // get username and password
    const { username, password } = req.body;

    // if any is missing, send "400 - Bad Request"
    if (!username || !password) return res.status(400).send();

    const user = await Users.checkUsernameExists(username);
    
    // if there's no user with that username, send "401 - Unauthorized"
    if (!user) return res.status(401).send();
    
    const hashed_password = crypto.createHash('md5').update(password + process.env.PASSWORD_SALT).digest('hex');

    console.log(hashed_password);

    // Password is not correct
    if (hashed_password !== user.user_password) return res.status(401).send();

    // TODO: authenticate user using JWT token

    return res.send();
})


export default loginRouter;