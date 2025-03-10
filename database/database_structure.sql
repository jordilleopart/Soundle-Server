-- Create database if it does not exist
CREATE DATABASE IF NOT EXISTS soundle_database;

-- Use the database
USE soundle_database;

-- Create tables if they do not exist
CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(50) NOT NULL UNIQUE,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_password CHAR(32) NOT NULL,
    join_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS track (
    track_id VARCHAR(255) PRIMARY KEY,
    track_name VARCHAR(255) NOT NULL,
    track_artist VARCHAR(255) NOT NULL,
    track_release_date DATE NOT NULL,
    track_cover_url VARCHAR(255) NOT NULL,
    track_audio_path VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS userStats (
    user_id CHAR(36),
    total_games INT NOT NULL DEFAULT 0,
    total_wins INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS playlist(
    playlist_id CHAR(36) PRIMARY KEY DEFAULT(UUID()),
    playlist_name VARCHAR(255) NOT NULL,
    playlist_description VARCHAR(255),
    playlist_creator CHAR(36) NOT NULL,
    FOREIGN KEY (playlist_creator) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS playlistTrack(
    playlist_id CHAR(36),
    FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id),
    track_id VARCHAR(255),
    FOREIGN KEY (track_id) REFERENCES track(track_id)
);

CREATE TABLE IF NOT EXISTS games (
    game_id CHAR(36) PRIMARY KEY,
    game_creator CHAR(36) DEFAULT NULL,
    num_players INT NOT NULL DEFAULT 0,
    max_players INT NOT NULL DEFAULT 6,
    rounds INT NOT NULL DEFAULT 5,
    playlist VARCHAR(255) NOT NULL,
    game_type VARCHAR(10) NOT NULL DEFAULT 'public',
    code CHAR(6) DEFAULT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (game_type IN ('private', 'public')),
    FOREIGN KEY (game_creator) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS game_scores (
    game_id CHAR(36),
    round INT,
    user_id CHAR(36),
    user_score INT,
    PRIMARY KEY (game_id, round, user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- TRIGGERS

DROP TRIGGER IF EXISTS after_user_insert;

-- Initialize stats for new user
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO userStats (user_id, total_games, total_wins)
    VALUES (NEW.user_id, 0, 0);
END;

DROP TRIGGER IF EXISTS before_insert_game;

-- Automatically generate code for private games
CREATE TRIGGER before_insert_game
BEFORE INSERT ON games
FOR EACH ROW
BEGIN
    IF NEW.game_type = 'private' THEN
        SET NEW.code = UPPER(SUBSTRING(UUID(), 1, 6));  -- Extract 6 characters from UUID and convert to uppercase
    END IF;
END;

-- Set to non-available any game that was created more than 24h ago and is still available (cleaning possible glitched games)
CREATE EVENT IF NOT EXISTS update_game_availability
ON SCHEDULE EVERY 1 DAY
STARTS '2025-03-05 00:00:00'
DO
    UPDATE games
    SET available = FALSE
    WHERE available = TRUE
    AND creation_date < NOW() - INTERVAL 1 DAY;
