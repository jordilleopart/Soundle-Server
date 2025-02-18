import 'dotenv/config';     // important to define it like this and at the top for all env variables to be initialized
import express from 'express';
import loginRouter from './routes/login.js';
import signupRouter from './routes/signup.js';

// initialize server
const PORT = process.env.PORT || 3000;
const app = express();

// middleware that executes for all requests, parsing json encoded bodies
app.use(express.json());

// import all subsections (routers) of the app
app.use("/login", loginRouter);
app.use("/signup", signupRouter);

// Start listening
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})