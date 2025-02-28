import { Command, Option } from 'commander';
import { initializeDatabase, exportDatabase, importDatabase, deleteDatabase, closePool } from './database/databaseActions.js';

// Function to set up and parse command-line arguments
export const parseArguments = async () => {
    const program = new Command();

    // Define the database option with choices using Option and addOption
    program
        .name('soundle-server') // Optional: Set the name of your CLI tool
        .description('A program to host a server where users can authenticate and play different game modes based on guessing the music.')
        .addOption(
            new Option('--db, --database <action>', 'Action to perform on the database')
                .choices(['reset', 'export', 'import', 'default'])
                .default('default')
        )
        .helpOption('-h, --help', 'Display help'); // Alias for help option

    // Parse the arguments
    program.parse(process.argv);

    // Get the database action argument
    const { database } = program.opts();

    // Async function to handle the database action based on the argument
    const handleDatabaseAction = async (action) => {
        try {
            switch (action) {
                case 'reset':
                    await deleteDatabase(); // Wait for delete to finish
                    await initializeDatabase(process.env.MYSQL_INIT_FILE); // Wait for initialization to finish
                    break;

                case 'export':
                    await exportDatabase(process.env.MYSQL_EXPORT_FILE); // Wait for export to finish
                    process.exit(0); // Exit the process after export

                case 'import':
                    await deleteDatabase(); // Wait for delete to finish
                    await initializeDatabase(process.env.MYSQL_INIT_FILE); // Wait for initialization to finish
                    await importDatabase(process.env.MYSQL_EXPORT_FILE); // Wait for import to finish
                    break;

                case 'default':
                    await initializeDatabase(process.env.MYSQL_INIT_FILE); // Wait for initialization to finish
                    break;
            }

            // After all actions are done, close the pool
            await closePool(); // Make sure to wait for the pool to be closed before the process ends
        } catch (err) {
            console.error('Error occurred during database action:', err);
            process.exit(1); // Exit the process with an error code if something goes wrong
        }
    };

    // Execute the database action based on the argument provided
    await handleDatabaseAction(database);
};
