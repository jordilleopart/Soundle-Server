import winston from 'winston';
import 'winston-daily-rotate-file'; // For log rotation

// Create a timestamped log format for HTTP request logs
const logFormatRequest = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss', // Timestamp format
    }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} - ${message}`;
    })
);

// General logging with simple formatting for output.log
const logFormatSimple = winston.format.simple();

// Create and configure the general logger for application logs (output.log + console)
const generalLogger = winston.createLogger({
    level: 'info', // Default log level
    transports: [
        // General log output to output.log (simple format)
        new winston.transports.File({
            filename: './logs/output.log',
            level: 'info', // Log level for this file
            format: logFormatSimple,
            maxsize: 100 * 1024 * 1024, // Rotate after 100 MB
            maxFiles: '14d', // Keep logs for 14 days
        }),

        // Console logging for development (optional)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

// Create and configure the **HTTP request logger** for requests.log
const requestLogger = winston.createLogger({
    level: 'info',
    transports: [
        // HTTP request logs to requests.log
        new winston.transports.DailyRotateFile({
            filename: './logs/requests.log',
            datePattern: 'YYYY-MM-DD', // Rotate logs daily
            maxsize: 100 * 1024 * 1024, // Rotate after 100 MB
            maxFiles: '14d', // Keep logs for 14 days
            level: 'info', // Log level for this file
            format: logFormatRequest, // Format for request logs
        }),
    ],
});

// Function to log HTTP requests (including auth events)
const logHttpRequest = (req, statusCode, userId = undefined) => {
    // Get the client's real IP address considering proxy headers
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const serverIp = req.connection.localAddress || req.socket.localAddress; // Server's IP
    const logMessage = `${clientIp} ${serverIp} ${userId || '-'} - - [${new Date().toISOString().replace('T', ' ').slice(0, 19)} +0000] "${req.method} ${req.originalUrl} HTTP/${req.httpVersion}" ${statusCode} "-" "${req.get('User-Agent') || '-'}"`;

    // Log format:
    // 1. ${req.ip} - Remote IP address of the client making the request.
    // 2. ${serverIp} - Local server IP address (from where the server is running).
    // 3. ${userId || '-'} - User ID extracted from JWT token, if available. If no user is authenticated, a '-' is used.
    // 4. [Date] - The timestamp when the request was logged (formatted as YYYY-MM-DD HH:mm:ss).
    // 5. "${req.method} ${req.originalUrl} HTTP/${req.httpVersion}" - The HTTP method (GET, POST, etc.), requested URL, and HTTP version.
    // 6. ${statusCode} - The HTTP response status code (e.g., 200, 401, 403, etc.).
    // 7. "-" - Placeholder for the content length (not included in the log).
    // 8. "${req.get('User-Agent') || '-'}" - The User-Agent string from the request header, describing the client's browser or app.

    // Log the HTTP request to requests.log (NOT generalLogger)
    requestLogger.info(logMessage);
};

// Export both loggers and logHttpRequest function
export { generalLogger, logHttpRequest };