import 'dotenv/config';     // important to define it like this and at the top for all env variables to be initialized
import cors from 'cors';
import express from 'express';
import ExpressWs from 'express-ws';
import { generalLogger } from './logger.js'; // Ensure logger is imported first
import loginRouter from './routes/login.js';
import signupRouter from './routes/signup.js';
import logoutRouter from './routes/logout.js';
import profileRouter from './routes/profile.js';
import { parseArguments } from './argparser.js'; // Import the argument parser
import authenticateJWTToken from './middlewares/authenticateJWTToken.js';

import trackInfoRouter from './routes/track_info.js';
import trackAudioRouter from './routes/track_audio.js';

// Parse the command-line arguments and handle the database action
await parseArguments();

// initialize server
const PORT = process.env.PORT || 3000;
// creates both an HTTP and a WebSocket server
var app = ExpressWs(express()).app;

// Define CORS options
const corsOptions = {
    origin: 'http://127.0.0.1:5500',  // Allow your frontend's origin
    methods: ['GET', 'POST', 'OPTIONS'],  // Allow only GET and POST requests
    allowedHeaders: ['Authorization', 'Content-Type'],  // Allow Authorization and Content-Type headers
    exposedHeaders: ['Authorization'],  // Expose the Authorization header to the client
};

// Use CORS middleware with the specified options
app.use(cors(corsOptions));

// middleware that executes for all requests, parsing json encoded bodies
app.use(express.json());

// import all subsections (routers) of the app
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/game", (await import('./routes/game.js')).default);

app.use(authenticateJWTToken);
app.use("/profile", profileRouter);
app.use("/logout", logoutRouter);

app.use("/track", trackInfoRouter);
app.use("/audio", trackAudioRouter);

// Start listening
app.listen(PORT, () => {
    generalLogger.info(`Server running on port ${PORT}`);
});