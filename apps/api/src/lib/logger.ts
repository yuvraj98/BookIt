import winston from 'winston'

const { combine, timestamp, colorize, printf, json, errors } = winston.format

const isDev = process.env.NODE_ENV !== 'production'

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`
  })
)

const prodFormat = combine(timestamp(), errors({ stack: true }), json())

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
})
