import { Router } from 'express';
import { passportCall } from '../services/auth.js';
import UsersManager from '../dao/mongo/managers/usersManager.js';
import LoggerService from '../services/LoggerService.js';
import config from '../config.js';


const logger = new LoggerService(config.logger.type); 

export default class BaseRouter {
  constructor() {
    this.router = Router();
    this.init();
  }
  init() { }

  getRouter = () => this.router;

  get(path, policies,role, ...callbacks) {
    this.router.get(path, passportCall('jwt', { strategyType: 'jwt' }), this.handlePolicies(policies),  this.generateCustomResponses,this.verifyCart(role), this.applyCallbacks(callbacks));
  }

  post(path, policies,/*role.*/...callbacks) {
    this.router.post(path, passportCall('jwt', { strategyType: 'jwt' }), this.handlePolicies(policies), this.generateCustomResponses, /*this.verifyCart(role),*/this.applyCallbacks(callbacks));
  }

  put(path, policies,role, ...callbacks) {
    this.router.put(path, passportCall('jwt', { strategyType: 'jwt' }), this.handlePolicies(policies), this.generateCustomResponses, this.verifyCart(role),this.applyCallbacks(callbacks));
  }

  delete(path, policies,role, ...callbacks) {
    this.router.delete(path, passportCall('jwt', { strategyType: 'jwt' }), this.handlePolicies(policies), this.generateCustomResponses, this.verifyCart(role),this.applyCallbacks(callbacks));
  }

  generateCustomResponses = (req, res, next) => {
    res.sendSuccess = message => res.send({ status: "success", message });
    res.sendSuccessWithPayload = payload => res.send({ status: "success", payload });
    res.sendBadRequest = error => res.status(400).send({ status: "error", error });
    res.sendInternalError = error => res.status(500).send({ status: "error", error });
    res.sendUnauthorized = error => res.status(401).send({ status: "error", error });
    res.sendNotFound = error => res.status(404).send({ status: "error", error })
    next();
  };

  handlePolicies = policies => {
    return (req, res, next) => {
      if (policies[0] === 'PUBLIC') return next();
      //Viene con el usuario parseado desde JWT
      const user = req.user;
      // Si el usuario quiere acceder a la ruta de logout, permitirlo sin realizar las verificaciones de políticas
      if (req.path === '/logout') return next();
      //Si tiene el policy PRIVATE
      if (policies[0] === "PRIVATE" && user) return next();
      //Si tiene el policy PRIVATE y no tiene user    
      if (policies[0] === "PRIVATE" && !user) return res.status(401).send({ status: "error", error: "Unauthorized.Please login" });
      //Si mis politicas dice NO-AUTH y tengo un usuario le tiro error de unauthorized
      if (policies[0] === 'NO_AUTH' && user) return res.status(401).send({ status: 'error', error: 'Unauthorized' });//No le puedo hacer con generateCustomResponses porque nuestras politicas se registan antes de las respuestas 
      //Si mis politicas dice NO-AUTH y no encuentro un usuario si lo deberia dejar pasar
      if (policies[0] === 'NO_AUTH' && !user) return next();
      //Si no encuentra usuario despues de todas auntentificar las policies si ME INTERESA que exista un USER
      if (!user) return res.status(401).send({ status: 'error', error: req.error });
      //Si existe el usuario y no es publico y no tiene que pasar la auth
      if (!policies.includes(user.role.toUpperCase())) return res.status(403).send({ status: "error", error: "Forbidden" });
      //Si cumple con todo continua
      next();
    }
  }

  applyCallbacks(callbacks) {
    return callbacks.map(callback => async (req, res, next) => {
      try {
        await callback.apply(this, [req, res, next]);
      } catch (error) {
        res.sendInternalError(error);
      }
    });
  }

  verifyCart = role => {
    return (req, res, next) => {
      const user = req.user;
      const userRole= user && user.role; 
      logger.logger.debug('userRole',userRole);
      const { cid } = req.params;
      const cartInUser = user?.cart?.toString(); // Chequea que el usuario exista
      if(!userRole) return next();
      if (userRole !== role) return next();
      if (userRole === 'admin' && !cartInUser) return next();
      logger.logger.debug('elcartdelciente', cartInUser);
      //Si no tengo un rol definido aun
      if (typeof role === 'undefined') return next();
      if (typeof userRole === 'undefined') return next();
      //Si tengo un rol pero no tengo un cid nviado aun
      if(userRole ==='user' && typeof cid === 'undefined') return next();
      //Si tengo un rol user definido
      if (userRole === 'user') {
        //Comparo el carrito enviado por parametros con el que me trae el usuario
      if (cid === cartInUser) return next();
      else { res.status(403).send({ status: "error", error: "Forbidden" }) }
      }
    
  
    }
  }
}   