import { passportCall } from '../services/auth.js';
import BaseRouter from './Router.js';
import cartsController from '../controllers/carts.controller.js'
import verifyCart from '../middlewares/verifyCart.js';

export default class CartsRouter extends BaseRouter {

  init() {

    //Busca un cart
    this.get('/:cid', ['USER', 'user', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.getCartById);

    //Crea un carrito con el producto enviado    
    this.post('/', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), cartsController.addProductToCart);

    //Agrega un producto con su cantidad al carrito
    this.post('/:cid/product/:pid', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.postProductInCart);

    //Deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba. 
    this.put('/:cid', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.updateCart);

    //Actualiza SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body. Si paso 3 por body voy a tener entonces 3 en qty
    //http://localhost:8080/api/carts/:cid/product/:pid
    this.put('/:cid/product/:pid', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.updateQtyProductInCart);

    //Elimina del carrito seleccionado el producto seleccionado
    //http://localhost:8080/api/carts/:cid/products/:pid
    this.delete('/:cid/product/:pid', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.deleteProductInCart);

    //Elimina los productos del carrito. Lo vacia
    //http://localhost:8080/api/carts/:cid
    this.delete('/:cid', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.deleteCart);

    //Finaliza el proceso de compra
    //http://localhost:8080/api/carts/:cid/purchase
    this.post('/:cid/purchase', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.checkoutCart);

    //Muestra el ticket de compra 
    //http://localhost:8080/api/carts/:cid/purchase
    this.get('/:cid/purchase', ['USER', 'PREMIUM'], passportCall('jwt', { strategyType: 'jwt' }), verifyCart, cartsController.checkoutDisplay);
  
  }
}

