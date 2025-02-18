import crypto from 'crypto';        // used for md5 hash for password storing
import { Router } from 'express';
import { Users } from '../database/database.js';    // used to access Users table from our MySQL database


const signupRouter = Router();

// manages incoming sign-up requests
signupRouter.post("/", async (req, res) => {
    // get username and password
    const { username, password } = req.body;

    // if any is missing, send "400 - Bad Request"
    if (!username || !password) return res.status(400).send();

    const user = await Users.checkUsernameExists(username);
    
    // there already exists a user with that username, send "409 - Conflict"
    if (user !== undefined) return res.status(409).send();
    
    // store hashed password
    const hashed_password = crypto.createHash('md5').update(password + process.env.PASSWORD_SALT).digest('hex');
    await Users.createNewUser(username, hashed_password);

    // send "201 - Created"
    return res.status(201).send();
})


export default signupRouter;