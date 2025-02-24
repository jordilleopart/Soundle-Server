import 'dotenv/config';     // important to define it like this and at the top for all env variables to be initialized
import cors from 'cors';
import express from 'express';
import ExpressWs from 'express-ws';
import loginRouter from './routes/login.js';
import signupRouter from './routes/signup.js';
import logoutRouter from './routes/logout.js';
import profileRouter from './routes/profile.js';
import authenticateJWTToken from './middlewares/authenticateJWTToken.js';

// initialize server
const PORT = process.env.PORT || 3000;
// creates both an HTTP and a WebSocket server
var app = ExpressWs(express()).app;

// Define CORS options
const corsOptions = {
	origin: '*',                                        // Allow any origin
	methods: ['GET', 'POST'],                           // Allow only GET and POST requests
	allowedHeaders: ['Authorization', 'Content-Type'],  // Allow Authorization and Content-Type headers
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

// Start listening
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});