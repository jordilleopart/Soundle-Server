import { Router } from 'express';
import { Games } from '../database/database.js';    // used to access Games table from our MySQL database

const gameRouter = Router();

// create a new game
gameRouter.post("/create", async (req, res) => {
    const {numPlayers, rounds, playlist, gameType} = req.body;

    const allFields = [numPlayers, rounds, playlist, gameType];

    // If any field is falsy, send "400 - Bad Request"
    if (allFields.some(field => !field)) {
        return res.status(400).send(JSON.stringify({ message: "Bad Request. Field(s) missing." }));
    }

    // create a new custom game
    const gameId = await Games.newCustomGame(req.user.user_id, numPlayers, rounds, playlist, gameType);

    return res.send({gameId});
});

// see available games
gameRouter.get("/available", async (req, res) => {
    // return all games that are available (in a paginated manner)
    const games = await Games.sortedAvailableGames();
    return res.send(games);
});

// join a game
gameRouter.post("/join/:game_id", async (req, res) => {
});

export default gameRouter;