import { Router } from 'express';
import { Users, UserStats } from '../database/database.js';    // used to access Users table from our MySQL database

const profileRouter = Router();

// access 'user_id' profile
profileRouter.get("/:user_name", async (req, res) => {
    const { user_name } = req.params;
    // retrieve user (if any) from database
    const user = await Users.checkUsernameExists(user_name);

    // if user does not exist, send "404 - Not Found"
    if (!user) return res.status(404).send(JSON.stringify({ message: "User not found." }));

    // retrieve stats of given user
    const userStats = await UserStats.getUserStats(user.user_id);

    return res.send({ user: user, userStats: userStats });
});

// access my own profile
profileRouter.get("/", async (req, res) => {
    // retrieve user (if any) from database
    const user = await Users.checkUsernameExists(req.user.user_name);

    // retrieve stats of given user
    const userStats = await UserStats.getUserStats(user.user_id);

    return res.send({ user: user, userStats: userStats });
});

export default profileRouter;