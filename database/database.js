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

    static async newCustomGame(game_creator, num_players, rounds, playlist, game_type) {
        // Create an uuid for the game
        const gameId = uuidv4();

        // Insert the new game into the database
        try {
            await pool.query(
                `INSERT INTO games (game_id, game_creator, num_players, rounds, playlist, game_type)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [gameId, game_creator, num_players, rounds, playlist, game_type]);
        } catch (err) {
            console.error(err);
            return 500; // Return 500 for internal server error (uuid is repeated)
        }

        return gameId;
    }

    static async sortedAvailableGames(sortBy = 'creation_date', sortOrder = 'DESC', pageNumber = 1, pageSize = 10) {
        // Calculate the offset for pagination
        const offset = (pageNumber - 1) * pageSize;
        
        const query = `
            SELECT * FROM games
            WHERE available = true
            ORDER BY ?? ${sortOrder}
            LIMIT ? OFFSET ?;`;

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

    static async filteredAvailableGames(filterBy = 'game_creator', filterValue, pageNumber = 1, pageSize = 10) {
        // Calculate the offset for pagination
        const offset = (pageNumber - 1) * pageSize;
    
        // Construct the SQL query with pagination and filter by creator_id
        const query = `
            SELECT * FROM games
            WHERE available = true AND ${filterBy} = ?
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
}