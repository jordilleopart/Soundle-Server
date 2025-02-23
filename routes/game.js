import { Router } from 'express';
import { Games } from '../database/database.js';    // used to access Games table from our MySQL database

const gameRouter = Router();

// create a new game
gameRouter.post("/create", async (req, res) => {
    const {maxPlayers, rounds, playlist, gameType} = req.body;

    const allFields = [maxPlayers, rounds, playlist, gameType];

    // If any field is falsy, send "400 - Bad Request"
    if (allFields.some(field => !field)) {
        return res.status(400).send(JSON.stringify({ message: "Bad Request. Field(s) missing." }));
    }

    // create a new custom game
    const gameId = await Games.newCustomGame(req.user.user_id, maxPlayers, rounds, playlist, gameType);

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
    const {game_id} = req.params;

    // join the game
    const status = await Games.addPlayerToGame(game_id);

    // if the game was successfully joined, return the game_id
    switch (status) {
        case 200:
            return res.send({game_id});
        case 422:
            return res.status(422).send(JSON.stringify({ message: "Unprocessable Entity. Game is full." }));
        case 500:
            return res.status(500).send(JSON.stringify({ message: "Internal Server Error." }));
    };
});

// leave a game
gameRouter.post("/leave/:game_id", async (req, res) => {
    const {game_id} = req.params;

    // join the game
    const status = await Games.removePlayerFromGame(game_id);

    // if the game was successfully joined, return the game_id
    switch (status) {
        case 200:
            return res.send({game_id});
        case 500:
            return res.status(500).send(JSON.stringify({ message: "Internal Server Error." }));
    };
});

export default gameRouter;