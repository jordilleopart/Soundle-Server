import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

// MySQL database connection config
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true, // Enable multiple SQL statements per query
};

// Create a MySQL connection pool with multipleStatements enabled
const pool = mysql.createPool(dbConfig);

// Function to return the correct path for mysql or mysqldump
const getCommandPath = (commandType) => {
    const mysqlPath = process.env.MYSQL_PATH || ''; // Get MySQL path from env or fallback to empty
    let command = commandType;

    // If MYSQL_PATH is set, ensure it is normalized and properly quoted
    if (mysqlPath) {
        const normalizedPath = path.normalize(mysqlPath);  // Normalize path to handle OS-specific paths
        command = `"${normalizedPath}${path.sep}${commandType}"`;  // Add command to the path and quote it
    }

    return command;  // Return the full path to the command
};

// Initialize the Database Using a SQL Script
export const initializeDatabase = async (sqlFilePath) => {
    try {
        // Read the SQL script from the file
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        
        // Execute the SQL script using multiple statements
        const [results] = await pool.query(sqlContent);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing the database:', err);
    }
};

// Export Database (Using mysqldump)
const execPromise = promisify(exec);

export const exportDatabase = async (outputFilePath) => {
    try {
        // Ensure the database exists before exporting
        await pool.query(`USE ${process.env.MYSQL_DB}`);

        const command = `${getCommandPath('mysqldump')} -u${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DB} > "${outputFilePath}"`;
        
        // Run the mysqldump command
        await execPromise(command);

        console.log('Database exported successfully to', outputFilePath);
    } catch (err) {
        console.error('Error exporting database:', err);
    }
};

// Import Database (Using mysql)
export const importDatabase = async (inputFilePath) => {
    try {
        // Ensure the database exists before importing
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB}`);
        await pool.query(`USE ${process.env.MYSQL_DB}`);  // Use the newly created or existing database

        const command = `${getCommandPath('mysql')} -u${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DB} < "${inputFilePath}"`;

        // Run the mysql command to import the database
        await execPromise(command);

        console.log('Database imported successfully from', inputFilePath);
    } catch (err) {
        console.error('Error importing database:', err);
    }
};

// Delete the Database
export const deleteDatabase = async () => {
    try {
        const query = `DROP DATABASE IF EXISTS ${dbConfig.database};`;
        await pool.query(query);
        console.log('Database deleted successfully');
    } catch (err) {
        console.error('Error deleting the database:', err);
    }
};

// Close the Pool Connection (Gracefully shut down the connection pool)
export const closePool = async () => {
    try {
        await pool.end();
    } catch (err) {
        console.error('Error closing the pool:', err);
    }
};
