-- Create database if it does not exist
DROP DATABASE IF EXISTS soundle_database;
CREATE DATABASE soundle_database;

-- Use the database
USE soundle_database;

-- Create table if it does not exist
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(50) NOT NULL UNIQUE,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_password CHAR(32) NOT NULL,
    join_date TIMESTAMP NOT NULL DEFAULT NOW()
); 

-- This table information is based on the Spotify API
CREATE TABLE track (
    track_id VARCHAR(255) PRIMARY KEY ,
    track_name VARCHAR(255) NOT NULL,
    track_artist VARCHAR(255) NOT NULL,
    track_album VARCHAR(255) NOT NULL,
    track_release_date INT NOT NULL,
    track_cover_url VARCHAR(255) NOT NULL,
    track_genere VARCHAR(255) NOT NULL,
    track_preview_url VARCHAR(255) -- This can be null in the Spotify API, check before adding to the database
);

CREATE TABLE userStats (
    user_id CHAR(36), 
    total_games INT NOT NULL DEFAULT 0,
    total_wins INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE playlist(
    playlist_id CHAR(36) PRIMARY KEY DEFAULT(UUID()),
    playlist_name VARCHAR(255) NOT NULL,
    playlist_description VARCHAR(255),
    playlist_creator CHAR(36) NOT NULL,
	FOREIGN KEY (playlist_creator) REFERENCES users(user_id)
);

CREATE TABLE playlistTrack(
    playlist_id CHAR(36),
    FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id),
    track_id VARCHAR(255),
    FOREIGN KEY (track_id) REFERENCES track(track_id)
);

CREATE TABLE games (
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
    CHECK (game_type IN ('private', 'public')),       -- Ensures type is either 'private' or 'public'
    FOREIGN KEY (game_creator) REFERENCES users(user_id)
);

CREATE TABLE game_scores (
    game_id CHAR(36),
    round INT,
    user_id CHAR(36),
    user_score INT,
    PRIMARY KEY (game_id, round, user_id), -- Composite primary key
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)


-- TRIGGERS

DROP TRIGGER IF EXISTS after_user_insert;

DELIMITER $$

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO userStats (user_id, total_games, total_wins)
    VALUES (NEW.user_id, 0, 0);
END $$

DELIMITER ;

DROP TRIGGER IF EXISTS before_insert_game;

DELIMITER $$

CREATE TRIGGER before_insert_game
BEFORE INSERT ON games
FOR EACH ROW
BEGIN
    -- If the game type is private, generate a 6-character uppercase code
    IF NEW.game_type = 'private' THEN
        SET NEW.code = UPPER(SUBSTRING(UUID(), 1, 6));  -- Extract 6 characters from UUID and convert to uppercase
    END IF;
END $$

DELIMITER ;