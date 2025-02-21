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
}