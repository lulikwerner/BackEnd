import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import passport from 'passport';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

import config from './config.js'
import { __dirname } from './utils.js';

import ProductRouter from './routes/productsM.router.js';
import CartRouter from './routes/cartsM.router.js';
import ViewsRouter from './routes/views.router.js';
import SessionRouter from './routes/session.router.js'
import UsersRouter from './routes/users.router.js'

import registerChatHandler from './listeners/chatHandler.js';
import cartSocket from './sockets/cart.sockets.js';

import initlizePassportStrategies from './config/passport.config.js'
import errorHandler from './middlewares/error.js'
import attachLogger from './middlewares/logger.js';
import LoggerService from '../src/services/LoggerService.js'



const app = express();
const PORT = config.app.PORT;
const logger = new LoggerService(config.logger.type);

const startServer = async (persistenceType) => {

  const swaggerOptions = {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'Documentacion ecommerce',
        description: 'Documentacion para API Ecommerce Joyas'
      }
    },
    apis: [`${__dirname}/docs/**/*.yaml`] //Van las rutas de los archivos que guardo en docs o ${__dirname}/../docs/**/*.yaml
  }

  const specs = swaggerJSDoc(swaggerOptions);
  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))//Le digo que se inizialize en /docs que lo procese en el panel swagger y que lo haga a partir de las configuraciones de las  specs


  //Conecto a mi puerto
  const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
  });

  const io = new Server(server);


  app.engine('handlebars', handlebars.engine());
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/views`);

  //Creo un condicional para que me haga comparativo de roles en el profile.handlebars y me muestre o no el boton de cambiar role
  const hbs = handlebars.create();
  hbs.handlebars.registerHelper('equalsIgnoreCase', function (a, b, options) {
    return a.toLowerCase() === b.toLowerCase();
  });

//Inicializo el passport
  app.use(passport.initialize());
  initlizePassportStrategies();

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(`${__dirname}/Public`));
 
//Congifuro para usar MongoAtlas
  app.use(session({
    store: new MongoStore({
      mongoUrl: config.mongoSecret.MongoURL,
      ttl: 3600
    }),
    secret: config.mongoSecret.secret,
    resave: false,
    saveUninitialized: false
  }))

  //Middleare para poder usar sockets
  const ioMiddleware = (req, res, next) => {
    req.io = io;
    next();
  };

  app.use(ioMiddleware);
  app.use(attachLogger)


//Pruebas de logger
  app.get('/loggerTest', (req, res) => {
    logger.logger.error("127.0.0.1 - there's no place like home");
    logger.logger.warning("127.0.0.1 - there's no place like home");
    logger.logger.http("127.0.0.1 - there's no place like home");
    logger.logger.info("127.0.0.1 - there's no place like home");
    logger.logger.debug("127.0.0.1 - there's no place like home");
    res.sendStatus(200);
  });



  const viewsRouter = new ViewsRouter()
  const sessionRouter = new SessionRouter();
  const cartRouter = new CartRouter();
  const productRouter = new ProductRouter();
  const usersRouter = new UsersRouter();
  
  //Son las rutas que uso
  app.use('/', viewsRouter.getRouter());
  app.use('/api/products', productRouter.getRouter());
  app.use('/api/carts', cartRouter.getRouter());
  app.use('/api/sessions', sessionRouter.getRouter());
  app.use('/api/users', usersRouter.getRouter());

  //El ErrorHandler va despues de mis rutas
  app.use(errorHandler)

  //El chat 
  io.on('connection', async (socket) => {
    registerChatHandler(io, socket);
    logger.logger.info('Socket connected');
  });

  //Llama al cartSocket
  cartSocket(io);
};

export default startServer;
