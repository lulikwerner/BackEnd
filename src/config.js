import dotenv from 'dotenv';


dotenv.config();

export default {
    app: {
        PORT: process.env.PORT || 8080,
        email: process.env.APP_EMAIL,
        password: process.env.APP_PASSWORD
    },
    adminPas: {
        adminEmail: process.env.ADMIN_EMAIL,
        adminPassword: process.env.ADMIN_PW
    },
    tokenKey: {
        key: process.env.TOKEN_SECRET_KEY
    },
    mongoSecret: {
        secret: process.env.MONGO_SECRET,
        MongoURL: process.env.MONGO_URL
    },
    gitHub: {
        ClientId: process.env.CLIENT_ID,
        Secret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CLIENT_URL
    },
    twilio: {
        Number: process.env.TWILIO_NUMBER,
        sid: process.env.TWILIO_SID,
        Token: process.env.TWILIO_TOKEN
    },
    logger: {
        type: process.env.LOGGER || 'dev',
    }
}