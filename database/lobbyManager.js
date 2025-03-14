class LobbyManager {
    constructor() {
        if (LobbyManager.instance) {
            return LobbyManager.instance;
        }
        this.lobbies = new Map();  // Map to store lobbyId -> lobbyData
        LobbyManager.instance = this;
    }

    // Adds a WebSocket to a specific lobby with an initial points value
    joinLobby(lobbyId, ws, userId) {
        let lobby = this.lobbies.get(lobbyId);

        if (!lobby) {
            // If the lobby doesn't exist, create a new lobby
            lobby = {
                masterId: userId,
                masterSocket: ws,
                masterPoints: 0,
                members: new Map(),
            };
            this.lobbies.set(lobbyId, lobby);
            return;
        }

        if (this.isMaster(lobbyId, userId)) {
            // If the user is the master, update the master's WebSocket
            lobby.masterSocket = ws;
        } else {
            // If the user is not the master, check if they are already a member
            if (!lobby.members.has(userId)) {
                // If the user is not already a member, add them with 0 points
                lobby.members.set(userId, { ws: ws, points: 0 });
            } else {
                // If the user is already a member, just update the WebSocket without resetting points
                let user = lobby.members.get(userId);
                user.ws = ws; // Update WebSocket only
            }
        }

        this.printLobbyDetails();
    }


    // Removes a WebSocket from a specific lobby
    leaveLobby(lobbyId, userId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;
    
        const isMaster = lobby.masterId === userId;
    
        // If the user is the master, handle master reassignment
        if (isMaster) {
            const remainingMembers = Array.from(lobby.members.keys());
    
            // If there are remaining members, promote a new master
            if (remainingMembers.length >= 1) { // More than 1 member left
                const newMaster = remainingMembers[0]; // Assign the first remaining member as the new master
                lobby.masterId = newMaster;
                lobby.masterSocket = lobby.members.get(newMaster).ws;
    
                // Now that the new master is assigned, remove the old master from members
                lobby.members.delete(userId);
            } else {
                // If no members are left after the master leaves, delete the lobby
                this.lobbies.delete(lobbyId);
            }

        } else {
            // If the user is not the master, just remove from the members list
            lobby.members.delete(userId);
        }

        this.printLobbyDetails();
    }

    // Get all WebSockets in a lobby
    getSocketsInLobby(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return [];
        return [lobby.masterSocket, ...Array.from(lobby.members.values()).map(member => member.ws)].filter(Boolean);
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
        lobby.members.forEach((member) => member.ws.close(1000, "Game finished."));
        this.lobbies.delete(lobbyId);
    }

    // Prints the lobby ID, master user ID, and the list of members with their points
    printLobbyDetails() {
        this.lobbies.forEach((lobby, lobbyId) => {
            console.log(`Lobby ID: ${lobbyId}`);
            console.log(`Master ID: ${lobby.masterId}`);
            console.log(`Master Points: ${lobby.masterPoints}`);
            console.log(`Members:`);
            if (lobby.members.size > 0) {
                lobby.members.forEach((member, userId) => {
                    console.log(`  - Member ID: ${userId}, Points: ${member.points}`);
                });
            } else {
                console.log(`  - No members in this lobby`);
            }
            console.log('----------------------');
        });
    }

    // Updates the points of a user in a specific lobby
    addUserPoints(lobbyId, userId, points) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;

        if (lobby.masterId === userId) {
            // Since master is not stored in members map, we access master directly
            lobby.masterPoints += points;
        } else {
            // Update points for member
            const member = lobby.members.get(userId);
            if (member) {
                member.points += points;
            }
        }

        this.printLobbyDetails();
    }
}

const lobbyManager = new LobbyManager();
export default lobbyManager;
