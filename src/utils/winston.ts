import winston from "winston";


export function createLogger(){
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.json(),
      winston.format.colorize()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
   
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  return logger
}

const logger=createLogger()


