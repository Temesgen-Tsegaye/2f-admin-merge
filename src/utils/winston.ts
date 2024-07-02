const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint, colorize, errors } = format;

const logger = createLogger({
  format: combine(
    errors({ stack: true }), // Add stack trace to log output
    // Colorize log messages
    timestamp(), // Add timestamp
    prettyPrint() // Pretty print log entries
  ),
  transports: [
    new transports.Console(), // Console transport for development
    new transports.File({ filename: "./logger/error.log", level: "error" }), // Error log file
    new transports.File({ filename: "./logger/info.log", level: "info" }), // Info log file
  ],
});

try {
  throw new Error("Some error");
} catch (err: any) {
  console.log(typeof err, err.message);
  logger.error(err); // Log an error
}
logger.info("Some info message"); // Log an info message
