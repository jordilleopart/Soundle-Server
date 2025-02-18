import mysql from 'mysql2/promise';

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
}