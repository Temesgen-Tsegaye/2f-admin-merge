const { createLogger, format, transports } = require("winston");

const { combine, timestamp, prettyPrint, colorize, errors } = format;

export const logger = createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp(), 
    prettyPrint() 
  ),
  transports: [
    new transports.Console(), 
    new transports.File({ filename: "./logger/error.log", level: "error" }),
    new transports.File({ filename: "./logger/info.log", level: "info" }), 
    new transports.File({ filename: "./logger/debug.log", level: "debug" }),
    new transports.File({ filename: "./logger/notice.log", level: "notice" }),
    new transports.File({ filename: "./logger/warning.log", level: "warning" }),
    new transports.File({ filename: "./logger/critical.log", level: "crit" }),
    new transports.File({ filename: "./logger/alert.log", level: "alert" }),
  ],
});

try {
  throw new Error("Some error");
} catch (err: any) {
  console.log(typeof err, err.message);
  logger.error(err); 
}

logger.info("Info Info");



