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
        const lobby = this.lobbies.get(lobbyId);

        if (!lobby) {
            // Create a new lobby if it doesn't exist
            console.log(`Creating new lobby with ID ${lobbyId} for user ${userId}`);
            this.lobbies.set(lobbyId, {
                masterId: userId,
                masterSocket: ws,
                members: new Map(),  // Map of userId -> WebSocket
            });
        } else {
            // If lobby exists, check if the user is already in the lobby
            if (this.isUserInLobby(lobbyId, userId)) {
                // If user is already in the lobby, update their WebSocket
                console.log(`User ${userId} is reconnecting, updating WebSocket.`);
                if (this.isMaster(lobbyId, userId)) {
                    // Update the master socket
                    lobby.masterSocket = ws;
                } else {
                    // Update the member socket
                    lobby.members.set(userId, ws);
                }
            } else {
                // Add the user as a new member to the lobby
                console.log(`User ${userId} is joining the lobby.`);
                lobby.members.set(userId, ws); // Add new user WebSocket
            }
        }
        this.printLobbyDetails();
    }


    // Removes a WebSocket from a specific lobby
    leaveLobby(lobbyId, userId) {
        const lobby = this.lobbies.get(lobbyId);
        if (lobby) {
            // Remove the user from the members map
            lobby.members.delete(userId);

            // If the user leaving was the master, we need to reassign the master
            if (lobby.masterId === userId) {
                // Reassign the first member in the lobby (if any) as the new master
                const newMaster = Array.from(lobby.members.keys())[0];
                if (newMaster) {
                    lobby.masterId = newMaster;
                    lobby.masterSocket = lobby.members.get(newMaster);
                } else { // If there are no more members in the lobby, remove it
                    this.lobbies.delete(lobbyId);
                }
            }
        }
    }

    getSocketsInLobby(lobbyId) {
        return this.lobbies.has(lobbyId) ? [...this.lobbies.get(lobbyId).members.values(), this.lobbies.get(lobbyId).masterSocket].filter(Boolean) : [];
    }
    
    // Broadcasts a message to all WebSocket connections in a specific lobby
    broadcastToLobby(lobbyId, author, content) {
        const wss = this.getSocketsInLobby(lobbyId);

        wss.forEach(ws => {
            ws.send(JSON.stringify({ "author": author, "content": content }));  // Sending a message to each WebSocket
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
        if (lobby) {
            // Check if the user is either the master or a member of the lobby
            return lobby.masterId === userId || lobby.members.has(userId);
        }
        return false;  // Return false if the lobby doesn't exist
    }

    // Closes all WebSocket connections in a specific lobby
    closeAllConnectionsInLobby(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (lobby) {
            // Close the master connection
            lobby.masterSocket.close(1000, "Game finished.");

            // Close all member connections
            lobby.members.forEach((ws) => {
                ws.close(1000, "Game finished.");
            });

            // Remove the lobby from the manager once all connections are closed
            this.lobbies.delete(lobbyId);
        }
    }

    // Prints the lobby ID, master user ID, and the list of members with clear distinction
    printLobbyDetails() {
        this.lobbies.forEach((lobby, lobbyId) => {
            console.log(`Lobby ID: ${lobbyId}`);
            console.log(`Master ID: ${lobby.masterId}`);  // Print master ID

            // Print members of the lobby
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
