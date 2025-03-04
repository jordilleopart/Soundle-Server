class LobbyManager {
    constructor() {
        if (LobbyManager.instance) {
            return LobbyManager.instance;
        }
        this.lobbies = new Map();  // Map to store lobbyId -> Set of ws (WebSocket) objects
        LobbyManager.instance = this;
    }

    // Adds a WebSocket to a specific lobby
    joinLobby(lobbyId, ws) {
        if (!this.lobbies.has(lobbyId)) {
            this.lobbies.set(lobbyId, new Set());
        }
        this.lobbies.get(lobbyId).add(ws);
    }

    // Removes a WebSocket from a specific lobby
    leaveLobby(lobbyId, ws) {
        const lobby = this.lobbies.get(lobbyId);
        if (lobby) {
            lobby.delete(ws);
            if (lobby.size === 0) {
                this.lobbies.delete(lobbyId);
            }
        }
    }

    // Retrieves all WebSocket objects for a specific lobby
    getSocketsInLobby(lobbyId) {
        return this.lobbies.get(lobbyId) || new Set();
    }

    // Broadcasts a message to all WebSocket connections in a specific lobby
    broadcastToLobby(lobbyId, author, content) {
        const wss = this.getSocketsInLobby(lobbyId);

        wss.forEach(ws => {
            ws.send(JSON.stringify({ "author": author, "content": content }));  // Sending a message to each WebSocket
        });
    }
}

const lobbyManager = new LobbyManager();
export default lobbyManager;
