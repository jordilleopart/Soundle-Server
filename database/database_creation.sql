-- Create database if it does not exist
DROP DATABASE IF EXISTS soundle_database;
CREATE DATABASE soundle_database;

-- Use the database
USE soundle_database;

-- Create table if it does not exist
CREATE TABLE users (
    user_id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_name VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL
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
    user_id BINARY(16), 
    total_games INT NOT NULL,
    total_wins INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE playlist(
    -- playlist_id BINARY(16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID()) check if necessary
    playlist_name VARCHAR(255) PRIMARY KEY NOT NULL,
    playlist_description VARCHAR(255),
    playlist_creator BINARY(16) NOT NULL,
	FOREIGN KEY (playlist_creator) REFERENCES users(user_id)
);

CREATE TABLE playlistTrack(
    playlist_name VARCHAR(255),
    FOREIGN KEY (playlist_name) REFERENCES playlist(playlist_name),
    track_id VARCHAR(255),
    FOREIGN KEY (track_id) REFERENCES track(track_id)
);