import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const ER_DUP_ENTRY_REGEX = /users\.(\S+)/;

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
}

// Collection of connections to the databse
const pool = mysql.createPool(dbConfig);

export class Users {
    static async checkUsernameExists(username) {
        const [user] = await pool.query(
            `SELECT *
            FROM users
            WHERE user_name = ?
            `, [username]);
        return user[0];
    }

    static async createNewUser(firstName, lastName, email, username, password) {
        try {
            // Attempt to insert the new user into the database
            await pool.query(
                `INSERT INTO users (first_name, last_name, user_email, user_name, user_password) 
                VALUES (?, ?, ?, ?, ?)
                `,
                [firstName, lastName, email, username, password]
            );
            return 200;
        } catch (err) {
            // Handle specific unique constraint violation error (MySQL)
            if (err.code === 'ER_DUP_ENTRY') {
                const key = err.sqlMessage.match(ER_DUP_ENTRY_REGEX)[1];
                // ER_DUP_ENTRY occurs when there's a duplicate entry for a unique field
                return {status: 409, key: key}; // Return 409 for conflict
            }
            return 500; // Return 500 for internal server error
        }
    }

    static async getUserProfile(user_id) {
        const [user] = await pool.query(
            `SELECT *
            FROM users u
            JOIN userStats us
            USING(user_id)
            WHERE u.user_id = ?
            `, [user_id]);
        return user[0];
    }
}

export class Games {
    static async getGameByGameId(gameId) {
        const [game] = await pool.query(
            `SELECT *
            FROM games
            WHERE game_id = ?
            `, [gameId]);
        return game[0];
    };

    static async systemDefaultGame(playlist) {
        // Create an uuid for the game
        const gameId = uuidv4();

        // Insert the new game into the database
        try {
            await pool.query(
                `INSERT INTO games (game_id, playlist)
                VALUES (?, ?)
                `, [gameId, playlist]);
        } catch (err) {
            console.error(err);
            return 500; // Return 500 for internal server error (uuid is repeated)
        }

        return gameId;
    }

    static async newCustomGame(game_creator, max_players, rounds, playlist, game_type) {
        // Create an uuid for the game
        const gameId = uuidv4();

        // Insert the new game into the database
        try {
            await pool.query(
                `INSERT INTO games (game_id, game_creator, max_players, rounds, playlist, game_type)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [gameId, game_creator, max_players, rounds, playlist, game_type]);
        } catch (err) {
            console.error(err);
            return 500; // Return 500 for internal server error (uuid is repeated)
        }

        return gameId;
    }

    static async sortedAvailableGames(sortBy = 'creation_date', sortOrder = 'DESC', pageNumber = 1, pageSize = 5) {
        // Calculate the offset for pagination
        const offset = (pageNumber - 1) * pageSize;

        const query = `
            SELECT g.*, u.user_name 
            FROM games g
            JOIN users u 
            ON g.game_creator = u.user_id
            WHERE g.available = true
            ORDER BY ?? ${sortOrder}
            LIMIT ? OFFSET ?;
            `;

        try {
            const [games] = await pool.query(query, [sortBy, pageSize, offset]);

            // Query the total count of available games for pagination metadata
            const [[totalCountRow]] = await pool.query(
                'SELECT COUNT(*) AS totalCount FROM games WHERE available = true'
            );
            const totalCount = totalCountRow.totalCount;

            // Return the result and pagination metadata
            return {
                games: games,
                pagination: {
                    totalCount,
                    pageNumber,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                }
            };

        } catch(err) {
            console.error(err);
            return 500; // Return 500 for internal server error
        }
    };

    static async filteredAvailableGames(filterBy = 'game_creator', filterValue, pageNumber = 1, pageSize = 5) {
        // Calculate the offset for pagination
        const offset = (pageNumber - 1) * pageSize;
    
        // Construct the SQL query with pagination and filter by creator_id
        const query = `
            SELECT g.*, u.user_name 
            FROM games g
            JOIN users u 
            ON g.game_creator = u.user_id
            WHERE g.available = true AND ${filterBy} = ?
            LIMIT ? OFFSET ?;
            `;
    
        try {
            const [games] = await pool.query(query, [filterValue, pageSize, offset]);

            // Query the total count of available games for pagination metadata
            const [[totalCountRow]] = await pool.query(
                'SELECT COUNT(*) AS totalCount FROM games WHERE available = true'
            );
            const totalCount = totalCountRow.totalCount;

            // Return the result and pagination metadata
            return {
                games: games,
                pagination: {
                    totalCount,
                    pageNumber,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                }
            };

        } catch(err) {
            console.error(err);
            return 500; // Return 500 for internal server error
        }
    };

    static async addPlayerToGame(gameId) {
        const connection = await pool.getConnection();

        try {
            // Start a transaction
            await connection.beginTransaction();
        
            // Lock the row and check num_players and max_players
            const [rows] = await connection.query(`
                SELECT num_players, max_players
                FROM games
                WHERE game_id = ?
                FOR UPDATE;
            `, [gameId]);
        
            const game = rows[0];
        
            // Check if num_players < max_players before updating
            if (game.num_players < game.max_players) {
                // Proceed to update num_players if condition is met
                const [updateResults] = await connection.query(`
                UPDATE games
                SET num_players = num_players + 1
                WHERE game_id = ?
                `, [gameId]);
        
                // Commit the transaction
                await connection.commit();
                // Release the connection back to the pool
                connection.release();

                if (updateResults.affectedRows > 0) return 200;
                else return 500; // Return 500 for internal server error
            } else {
                await connection.rollback();
                // Release the connection back to the pool
                connection.release();

                return 422; // Return 422 for Unprocessable Entity
            }
        } catch (err) {
            await connection.rollback();
            // Release the connection back to the pool
            connection.release();
            return 500; // Return 500 for internal server error
        }
    };

    static async removePlayerFromGame(gameId) {
        const connection = await pool.getConnection();
    
        try {
            // Start a transaction
            await connection.beginTransaction();
    
            // Lock the row and check num_players and max_players
            const [rows] = await connection.query(`
                SELECT num_players, max_players, available
                FROM games
                WHERE game_id = ?
                FOR UPDATE;
            `, [gameId]);
    
            const game = rows[0];
    
            // Proceed to update num_players
            const newNumPlayers = game.num_players - 1;
    
            // If num_players becomes 0, also set available to false
            let updateQuery = `
                UPDATE games
                SET num_players = ?, available = ?
                WHERE game_id = ?
            `;
            const updateValues = newNumPlayers === 0 ? [newNumPlayers, false, gameId] : [newNumPlayers, game.available, gameId];
    
            const [updateResults] = await connection.query(updateQuery, updateValues);
    
            // Commit the transaction
            await connection.commit();
            connection.release();
    
            if (updateResults.affectedRows > 0) return 200;  // 200 OK
            else return 500;  // 500 Internal Server Error if update failed
        } catch (err) {
            await connection.rollback();
            connection.release();
            return 500;  // 500 Internal Server Error for unexpected error
        }
    };
}

export class Track {
    static async createNewTrack(id, name, artist, release_date, album_cover_url, preview_url) {
        await pool.query(
            `INSERT INTO track (track_id, track_name, track_artist, track_release_date, track_cover_url, track_preview_url)
            VALUES (?, ?, ?, ?, ?, ?)
            `, [id, name, artist, release_date, album_cover_url, preview_url]);
    }

    static async checkTrackExists(id) {
        const [track] = await pool.query(
            `SELECT *
            FROM track
            WHERE track_id = ?
            `, [id]);
        return track[0];
    }
  
    static async getRandomTrack() {
        const [track] = await pool.query(
            `SELECT track_id, track_name, track_artist, track_release_date, track_cover_url, track_preview_url
            FROM track
            ORDER BY RAND()
            LIMIT 1
            `);
        return track[0]; // Devuelve el primer (y único) resultado
    }
}