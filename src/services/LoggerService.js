import winston from 'winston';

export default class LoggerService {
    constructor(env) { //aca le envio si es en desarrollo o en  produccion
        this.options = {
            levels: {
                fatal: 0,
                error: 1,
                warning: 2,
                http: 3,
                info: 4,
                debug: 5
            }
        }
        this.logger = this.createLogger(env);
    }
    createLogger = (env) => {
        switch (env) {
            case 'dev':
                return winston.createLogger({
                    levels: this.options.levels,
                    transports: [
                        new winston.transports.Console({
                            level: 'debug',
                            format: winston.format.combine(winston.format.colorize({ colors: this.options.colors }),
                                winston.format.simple()
                            ),
                        }),
                        new winston.transports.File({ level: 'error', filename: './errors.log' })
                    ]
                })
            case 'prod':
                return winston.createLogger({
                    levels: this.options.levels,
                    transports: [
                        new winston.transports.Console({
                            level: 'info',
                            format: winston.format.combine(winston.format.colorize({ colors: this.options.colors }),
                                winston.format.simple()
                            ),
                        }),
                        new winston.transports.File({ level: 'error', filename: './errors.log' })
                    ]
                })
        }
    }
}
