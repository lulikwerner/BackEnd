import { Router } from 'express';
import { passportCall } from '../services/auth.js';
import BaseRouter from '../routes/Router.js'
import viewsController from '../controllers/views.controller.js';
import config from '../config.js';
import modifyProducts from '../middlewares/modifyProducts.js';
import uploader from '../middlewares/uploader.js'

const router = Router();


export default class ViewsRouter extends BaseRouter {

  init() {

    this.get('/', ['PRIVATE', 'NO_AUTH'], viewsController.welcome);

//Para mandar email
this.get('/mail',['USER','PUBLIC'],passportCall('jwt', { strategyType: 'jwt' }), viewsController.mail);

//Para mandar sms
this.get('/sms', ['USER','PUBLIC'], passportCall('jwt', { strategyType: 'jwt' }), viewsController.sms)

//Formulario para cargar productos nuevos y muestra los productos y los puedo eliminar 
this.get('/realTimeProducts' ,['ADMIN','PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }),viewsController.realTimeProducts);

//Muestra los productos, filtro y ordeno
this.get('/products', ['USER','PUBLIC','PREMIUM','user','ADMIN'],passportCall('jwt', { strategyType: 'jwt' }), viewsController.getProducts);

//Abre el chat
this.get('/chat',['USER','PREMIUM'],viewsController.chat);

//Muestro los productos que tiene el carrito
this.get('/cart/:cid',['USER','ADMIN','PREMIUM'],passportCall('jwt', { strategyType: 'jwt' }), viewsController.productsInCart);

this.get('/register',['NO_AUTH'], passportCall('register',{strategyType:'jwt'}), viewsController.register);

this.get('/login', ['NO_AUTH'],passportCall('login', { strategyType: 'jwt' }), viewsController.login);

this.get('/profile', ['USER','ADMIN','PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), viewsController.profile);

this.get('/restoreRequest', ['NO_AUTH'], passportCall('login', { strategyType: 'jwt' }), viewsController.restoreRequest);

this.get('/restorePassword',['NO_AUTH'], passportCall('jwt', { strategyType: 'jwt' }), viewsController.restorePassword);
//me trae la informacion del cliente
this.get('/premium/:uid',['PRIVATE'], passportCall('jwt', { strategyType: "locals" }),viewsController.profileRole);

this.get('/premium/:uid/documents', ['PRIVATE'], passportCall('jwt',{ strategyType: "jwt"}), viewsController.upload)

this.get('/search',['ADMIN'], passportCall('jwt', { strategyType: "locals" }), viewsController.showUser);

this.get('/search/:uid',['ADMIN'], passportCall('jwt', { strategyType: "locals" }), viewsController.searchUser);
}}