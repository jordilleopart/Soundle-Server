import crypto from 'crypto';        // used for md5 hash for password storing
import { Router } from 'express';
import { Users } from '../database/database.js';    // used to access Users table from our MySQL database
import { logHttpRequest } from '../logger.js';


const signupRouter = Router();

// manages incoming sign-up requests
signupRouter.post("/", async (req, res) => {
    // get username and password
    const { firstName, lastName, email, username, password } = req.body;

    const allFields = [firstName, lastName, email, username, password];

    // If any field is falsy, send "400 - Bad Request"
    if (allFields.some(field => !field)) {
        logHttpRequest(req, 400);
        return res.status(400).send(JSON.stringify({ message: "Bad Request. Field(s) missing." }));
    }
    
    // store hashed password
    const hashed_password = crypto.createHash('md5').update(password + process.env.PASSWORD_SALT).digest('hex');
    const response = await Users.createNewUser(firstName, lastName, email, username, hashed_password);

    // there already exists a user with that username or email, send "409 - Conflict"
    if (response.status === 409) {
        logHttpRequest(req, 409);
        return res.status(409).send(JSON.stringify({ message: response.key }));
    }
    else if (response.status === 500) {
        logHttpRequest(req, 500);
        return res.status(500).send(JSON.stringify({ message: "Internal Server Error." }));
    }

    // send "201 - Created"
    logHttpRequest(req, 201);
    return res.status(201).send();
})


export default signupRouter;