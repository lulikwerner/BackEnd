import passport from "passport";
import local from "passport-local";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { usersServices, cartsM } from '../dao/mongo/managers/index.js';
import ErrorService from '../services/Error/ErrorService.js';
import { userErrorIncompleteValue } from '../constants/userErrors.js'
import EErrors from '../constants/EErrors.js'


import GithubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../services/auth.js";
import { cookieExtractor } from "../utils.js";
import config from '../config.js';
import TokenDTO from '../dto/user/TokenDTO.js'
import AdminDTO from '../dto/user/AdminDTO.js'
import LoggerService from '../services/LoggerService.js';



const logger = new LoggerService(config.logger.type); 


const LocalStrategy = local.Strategy; //Es la estrategia
const JWTStrategy = Strategy;

const initlizePassportStrategies = () => {
  logger.logger.debug('entro al initialized');


  //username y password son obligatorios extraerlos por eso te lo pide. Pongo el valor en true passReqToCallback: true para que me deje extraer la otra info del user y le digo que el email va a ser el username field usernameField:'email' 
  passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' }, async (req, email, password, done) => {
    try {
      //Aca extraigo todo lo que quiero que no sea username y password
      const { first_name, last_name, age, role } = req.body;
      //Corroboro que completen todos los campos de registro
      if (!first_name || !last_name || !age || !email || !password) {
        //Aqui genero el error
        ErrorService.createError({
          name: 'User creation error',
          cause: userErrorIncompleteValue({ first_name, email, password }),
          message: 'Error creating a new user',
          code: EErrors.INCOMPLETE_VALUES,
          status: 400
        })

      }
      if (isNaN(age) || age < 0) { done(null, false, { message: 'Ingrese una edad valida' }) }
      //Busco si ya existe el usuario
      const exists = await usersServices.getUserBy({ email });
      if (exists) { done(null, false, { message: 'El usuario ya existe' }) }
      //Si no existe el usuario en la db. Encripto la contrasenia
      else {
        const hashedPassword = await createHash(password);

        //Construyo el usuario que voy a registrar
        const newUser = {
          first_name,
          last_name,
          age,
          role,
          email,
          password: hashedPassword,
          documents: {},
          thumbnail:{}

        };
        
        const result = await usersServices.createUsers(newUser);
        logger.logger.info('el resultado es', result);
       
        const products = []; // Using const to declare an empty array
        // Initialize with an empty array or any initial products
      

        const newCart = await cartsM.createCart(products);
        const cartId = newCart._id.toString();
        const userId = result._id.toString();
        const user = await usersServices.updateUsers({ _id: userId }, { cart: cartId });

        //Si todo salio ok,
        done(null, result);
      }
    } catch (error) {
      done(error)
    }
  }))

  //le digo que el email va a ser el field username
  passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    //PASSPORT SOLO DEBE DEVOLVER EL USUARIO FINAL. NO ES RESPONSABLE DE LA SESION
    logger.logger.debug('entro al initialized');
    
    let user;
    try {
      if (email === config.adminPas.adminEmail && password === config.adminPas.adminPassword) {
        //Aca inicializo el admin
        user = new AdminDTO(user)
        logger.logger.info('user admin', user);
        return done(null, user);

      }
      console.log(email)
      user = await usersServices.getUserBy({ email }); //Solo busco por email
      console.log(email)
      if (!user) return done(null, false, { message: "Credenciales incorrectas" });
      // Si el usuario existe valido el pw
      const isPasswordValid = await isValidPassword(password, user.password);
      logger.logger.debug(password);
      logger.logger.debug(user.password);
      if (!isPasswordValid) return done(null, false, { message: "contrasenia incorrecta" });
      //Si el usuario existe y la contrasenia es correcta entonces devuelvo la sesion en passport
      user = new TokenDTO(user)
      //Cuando no usaba el dto
      /*user = {
          id:user._id,  
          first_name: user.first_name,
          last_name: user.last_name,
          age:user.age,
          cart: user.cart, //aca me tiene que traer el id del cart
          email: user.email,
          role: user.role
      };*/
      return done(null, user);

    } catch (error) {
      return done(error);
    }
  }));

  passport.use('github', new GithubStrategy({
    clientID: 'Iv1.1dd1410ac14946b5', //config.gitHub.ClientId,
    clientSecret: '795760751219fa0e7038b9f9bbaa1e1f5d768235', //config.gitHub.Secret,
    callbackURL: 'https://backend-commerce-dev.onrender.com/api/sessions/githubcallback' //config.gitHub.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
 
      logger.logger.debug('entrostrategygithub');
      logger.logger.info('el perfil', profile);
      //Tomo los datos que me sirven
      const { name, email } = profile._json;
      const user = await usersServices.getUserBy({ email });

      if (!user) {
        //Si el usuario no existe lo creo yo
        const newUser = {
          first_name: name,
          email,
          age: 23,
          password: '',
        }

        //Creo el nuevo usuario
        const result = await usersServices.createUsers(newUser);
        done(null, result)
      }
      //Si el usuario ya existia
      done(null, user);
    } catch (error) {
      logger.logger.error('errorrrr')
      done(error);
    }
  }))

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: config.tokenKey.key
  }, async (payload, done) => {
    //Busco por id el user y lo retorno
    try {
      const userId = payload.id || payload._id;
      const user = await usersServices.getUserBy({ _id: userId });
      if (user) {
        logger.logger.info('User found:', user);
        return done(null, user);
      }
      //Si el id es 0 entonces es admin y devuelvo el admin
      if (payload.id === 0 || payload._id === 0) {
        logger.logger.debug('Admin user detected');
        const adminUser = new AdminDTO(user)
        return done(null, adminUser);
      } else {
        logger.logger.debug('User not found');
        return done(null, false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return done(error);
    }
  }
  )
  );
};
export default initlizePassportStrategies;