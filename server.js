import 'dotenv/config';  // important to define it like this and at the top for all env variables to be initialized
import fs from 'fs';
import cors from 'cors';
import https from 'https';
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

// Path to your SSL certificate files (you need to have these in your project)
const sslOptions = {
    key: fs.readFileSync(process.env.SSL_PRIVATE_KEY),  // Replace with your private key
    cert: fs.readFileSync(process.env.SSL_CERTIFICATE),  // Replace with your certificate
};

// Creates both an HTTPS and a WebSocket server
var app = ExpressWs(express()).app;

// Define CORS options
const corsOptions = {
    origin: '*',  // Allow your frontend's origin
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

// Start listening over HTTPS
https.createServer(sslOptions, app).listen(PORT, () => {
    generalLogger.info(`Server running over HTTPS on port ${PORT}`);
});