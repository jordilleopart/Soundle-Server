-- Create database if it does not exist
DROP DATABASE IF EXISTS soundle_database;
CREATE DATABASE soundle_database;

-- Use the database
USE soundle_database;

-- Create table if it does not exist
CREATE TABLE users (
    uuid BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_name VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL
);
