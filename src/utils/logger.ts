import { createLogger, format, transports } from "winston";
import moment from "moment";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.resolve(__dirname, "..", "..", "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format
const customFormat = format.printf(({ level, message, timestamp, ...meta }) => {
    return (
        `[${timestamp}] ${level.toUpperCase()}: ${message}` +
        (meta && Object.keys(meta).length ? `\n→ Meta: ${JSON.stringify(meta, null, 2)}` : "")
    );
});

// Logger instance
const logger = createLogger({
    level: "info",
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: () => moment().format("DD-MM-YYYY hh:mm:ss A") }),
        customFormat
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        new transports.File({ filename: path.join(logDir, "combined.log") }),
    ],
});

// Add console logger for development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        })
    );
}

export default logger;
