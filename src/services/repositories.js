import { createCartDAO, createProductDAO , createCheckoutDAO } from '../dao/factory.js';
import CartRepository from './repositories/cart.service.js'
import ProductRepository from './repositories/product.service.js';
import CheckoutRepository from './repositories/checkout.service.js';
import UserRepository from './repositories/user.service.js';
import UserManager from '../dao/mongo/managers/usersManager.js';



//Como uso el Factory para Carts y Products los traigo asi
const persistenceType = 'MONG0'?'MONGO':'FILESYSTEM'

export const cartService =  new CartRepository(await createCartDAO(persistenceType)); 
export const productService = new ProductRepository(await createProductDAO(persistenceType));
export const checkoutService = new CheckoutRepository (await createCheckoutDAO(persistenceType));
//Como directamente importo el manager de users lo tengo que instanciar
export const userService = new UserRepository (new UserManager());







