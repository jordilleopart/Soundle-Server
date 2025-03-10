class LobbyManager {
    constructor() {
        if (LobbyManager.instance) {
            return LobbyManager.instance;
        }
        this.lobbies = new Map();  // Map to store lobbyId -> lobbyData
        LobbyManager.instance = this;
    }

    // Adds a WebSocket to a specific lobby
    joinLobby(lobbyId, ws, userId) {
        let lobby = this.lobbies.get(lobbyId);

        if (!lobby) {
            console.log(`Creating new lobby with ID ${lobbyId} for user ${userId}`);
            lobby = {
                masterId: userId,
                masterSocket: ws,
                members: new Map(),
            };
            this.lobbies.set(lobbyId, lobby);
        } else if (this.isUserInLobby(lobbyId, userId)) {
            console.log(`User ${userId} is reconnecting, updating WebSocket.`);
            if (this.isMaster(lobbyId, userId)) {
                lobby.masterSocket = ws;
            } else {
                lobby.members.set(userId, ws);
            }
        } else {
            console.log(`User ${userId} is joining the lobby.`);
            lobby.members.set(userId, ws);
        }
    }

    // Removes a WebSocket from a specific lobby
    leaveLobby(lobbyId, userId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;

        const isMaster = lobby.masterId === userId;
        lobby.members.delete(userId);

        if (isMaster) {
            const newMaster = Array.from(lobby.members.keys())[0];
            if (newMaster) {
                lobby.masterId = newMaster;
                lobby.masterSocket = lobby.members.get(newMaster);
            } else {
                this.lobbies.delete(lobbyId);  // No members left, delete the lobby
            }
        }
    }

    // Get all WebSockets in a lobby
    getSocketsInLobby(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return [];
        return [...lobby.members.values(), lobby.masterSocket].filter(Boolean);
    }

    // Returns an array of userIds for all users in the lobby (including master)
    getUserIdsInLobby(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return [];  // If lobby does not exist, return an empty array

        // Create an array of userIds including the master and the members
        const userIds = [lobby.masterId, ...Array.from(lobby.members.keys())];

        return userIds;
    }

    // Broadcasts a message to all WebSocket connections in a specific lobby
    broadcastToLobby(lobbyId, message) {
        const wss = this.getSocketsInLobby(lobbyId);

        wss.forEach(ws => {
            ws.send(message);
        });
    }

    // Check if a user is the master of the lobby
    isMaster(lobbyId, userId) {
        const lobby = this.lobbies.get(lobbyId);
        return lobby ? lobby.masterId === userId : false;
    }

    // Checks if a user is in a specific lobby
    isUserInLobby(lobbyId, userId) {
        const lobby = this.lobbies.get(lobbyId);
        return lobby ? lobby.masterId === userId || lobby.members.has(userId) : false;
    }

    // Closes all WebSocket connections in a specific lobby
    closeAllConnectionsInLobby(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;

        lobby.masterSocket.close(1000, "Game finished.");
        lobby.members.forEach((ws) => ws.close(1000, "Game finished."));
        this.lobbies.delete(lobbyId);
    }

    // Prints the lobby ID, master user ID, and the list of members with clear distinction
    printLobbyDetails() {
        this.lobbies.forEach((lobby, lobbyId) => {
            console.log(`Lobby ID: ${lobbyId}`);
            console.log(`Master ID: ${lobby.masterId}`);
            console.log(`Members:`);
            if (lobby.members.size > 0) {
                lobby.members.forEach((ws, userId) => {
                    console.log(`  - Member ID: ${userId}`);
                });
            } else {
                console.log(`  - No members in this lobby`);
            }
            console.log('----------------------');
        });
    }
}

const lobbyManager = new LobbyManager();
export default lobbyManager;
