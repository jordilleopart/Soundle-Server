import { Router } from 'express';
import { Games } from '../database/database.js';    // used to access Games table from our MySQL database
import lobbyManager from '../database/lobbyManager.js';  // used to access LobbyManager singleton instance
import authenticateJWTToken from '../middlewares/authenticateJWTToken.js';
import authenticateWSJWTToken from '../middlewares/authenticateWSJWTToken.js';  // used to authenticate WebSocket connections

const gameRouter = Router();

// create a new game
gameRouter.post("/create", authenticateJWTToken, async (req, res) => {
    const {maxPlayers, rounds, playlist, gameType} = req.body;

    const allFields = [maxPlayers, rounds, playlist, gameType];

    // If any field is falsy, send "400 - Bad Request"
    if (allFields.some(field => !field)) {
        return res.status(400).send(JSON.stringify({ message: "Bad Request. Field(s) missing." }));
    }

    // create a new custom game
    const game_id = await Games.newCustomGame(req.user.user_id, maxPlayers, rounds, playlist, gameType);

    return res.send(JSON.stringify({gameId: game_id}));
});

// see available games
gameRouter.get("/available", authenticateJWTToken, async (req, res) => {
    // return all games that are available (in a paginated manner)
    const games = await Games.sortedAvailableGames();
    return res.send(JSON.stringify(games));
});

// join a game
gameRouter.post("/join/:game_id", authenticateJWTToken, async (req, res) => {
    const {game_id} = req.params;

    // join the game
    const status = await Games.addPlayerToGame(game_id);

    // if the game was successfully joined, return the game_id
    switch (status) {
        case 200:
            return res.send(JSON.stringify({gameId: game_id}));
        case 422:
            return res.status(422).send(JSON.stringify({ message: "Unprocessable Entity. Game is full." }));
        case 500:
            return res.status(500).send(JSON.stringify({ message: "Internal Server Error." }));
    };
});

// leave a game
gameRouter.post("/leave/:game_id", authenticateJWTToken, async (req, res) => {
    const {game_id} = req.params;

    // join the game
    const status = await Games.removePlayerFromGame(game_id);

    // if the game was successfully joined, return the game_id
    switch (status) {
        case 200:
            return res.send(JSON.stringify({gameId: game_id}));
        case 500:
            return res.status(500).send(JSON.stringify({ message: "Internal Server Error." }));
    };
});

// manage games messages
// listens at ws://localhost:3000/game/:game_id
gameRouter.ws("/:game_id", function(ws, req) {
    
    // Use the authentication middleware
    authenticateWSJWTToken(req, ws, () => {
        const {game_id} = req.params;

        // join the game
        lobbyManager.joinLobby(game_id, ws);

        // send message that user has joined the game
        lobbyManager.broadcastToLobby(game_id, "system", `${ws.user_name} has joined the game.` );

        ws.on('message', function(message) {
            console.log(message)
            // parse message
            const msg = JSON.parse(message);

            // manage different types of messages
            switch (msg.type) {
                case "chat":
                    // broadcast the message to all players in the game
                    lobbyManager.broadcastToLobby(game_id, "TBD", msg.content);
                    break;
                case "start":
                    // start the game
                    break;
                case "next":
                    // next round
                    break;
                case "end":
                    // end the game
                    break;
            }
        });

        // user decides to leave the game
        ws.on('close', function(code, reason) {
            // leave the game
            lobbyManager.leaveLobby(game_id, ws);
            // send message that user has left the game

            switch (code) {
                case 1000:
                    console.log("User left the game");
                    lobbyManager.broadcastToLobby(game_id, "system", `${ws.user_name} has left the game.`);
                    break;
                case 1008:
                    lobbyManager.broadcastToLobby(game_id, "system", `${ws.user_name} lost connection.`);
                    break;
            }
        });

    });
});

export default gameRouter;