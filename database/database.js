import mysql from 'mysql2/promise';

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

    static async createNewUser(username, password) {
        await pool.query(
            `INSERT INTO users (user_name, user_password)
            VALUES (?, ?)
            `, [username, password]);
    }

    static async createNewUser(firstName, lastName, email, username, password) {
        try {
            // Attempt to insert the new user into the database
            await pool.query(
                `INSERT INTO users (first_name, last_name, user_email, user_name, user_password) 
                VALUES (?, ?, ?, ?, ?)`,
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
}

export class UserStats {
    static async getUserStats(user_id) {
        const [userStats] = await pool.query(
            `SELECT *
            FROM userStats
            WHERE user_id = ?
            `, [user_id]);

        return userStats[0];
    }
}