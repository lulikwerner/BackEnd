import EErrors from '../constants/EErrors.js'
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

import config from '../config.js';
import { cartService, productService, userService } from '../services/repositories.js'
import ticketModel from '../dao/mongo/models/tickets.js';
import checkoutTicketModel from '../dao/mongo/models/checkout.js';
import { productsInvalidValue } from '../constants/productErrors.js';
import { cartsInvalidValue } from '../constants/cartErrors.js';
import ErrorService from '../services/Error/ErrorService.js';
import LoggerService from '../services/LoggerService.js';


const logger = new LoggerService(config.logger.type);

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: config.app.email,
    pass: config.app.password,
  },
});

const addProductToCart = async (req, res) => {
  const products = req.body;
  const cart = req.body;

  try {
    if (!Array.isArray(cart)) {
      return res.sendBadRequest('Cart should be an array');
    }
    // Chequeo si el pid o el stock tiene valores
    for (const products of cart) {
      if (!products._id || !products.quantity) {
        return res.sendBadRequest('One or more fields are incomplete for a product');
      }

      //Chequeo si las cantidades sean un numero o mayor a 0
      if (isNaN(products.quantity) || products.quantity < 0) {
        return res.sendBadRequest('Enter a valid value for the  products');
      }
    }
    console.log('losproductos a agregar', products)
    const createdCart = await cartService.createCartService(products);

    if (!createdCart) {
      return res.sendBadRequest('Failed to create the cart');
    }
    return res.sendSuccess('Cart created and products added successfully');

  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.sendBadRequest('One or more products do not exist');
    }
    console.error(error);
    return res.sendInternalError('Internal server error');
  }
};

const getCartById = async (req, res, done) => {
  const { cid } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      {
        ErrorService.createError({
          name: 'Cart input error',
          cause: cartsInvalidValue(req.params),
          message: 'Please enter a valid cart ID',
          code: EErrors.INVALID_VALUE,
          status: 400
        })
      }
    }
    const cart = await cartService.getCartByIdService(cid);
    logger.logger.debug(cart);

    // Si no encuentra el cart
    if (!cart) {
      return res.sendBadRequest('Cart not found');
    }
    // Si el cart se encuentra renderizo la info
    res.render('cart', { carth: cart });

  } catch (error) {
    done(error);
  }
};

const postProductInCart = async (req, res, done) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body
  logger.logger.info(pid);
  logger.logger.info('cid', cid)
  logger.logger.info('qty', quantity);
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  try {
    //Evaluo que la cantidad sea mayor a 1
    if (quantity < 1) return res.sendBadRequest('The quantity must be greater than 1');
    //Busco el Producto
    const checkIdProduct = await productService.getProductByService({ _id: pid });

    //Si no se encuentra el producto
    if (!checkIdProduct) { return res.sendBadRequest('Product not found') };
    //Busco el carrito
    const checkIdCart = await cartService.getCartByIdService({ _id: cid });

    //Si no se encuentra el carrito
    if (!checkIdCart) { return res.sendBadRequest('Cart not found') };
    //Tiene que enviar algun dato aunque sea para modificar

    if (!title && !description && !code && !price && !stock && !category && !quantity) {
      {
        ErrorService.createError({
          name: 'Missing values to update',
          cause: productsInvalidValue(req.params),
          message: 'Please send a new value to update',
          code: EErrors.INCOMPLETE_VALUES,
          status: 400
        })
      }
    }

    //Evaluo que la cantidad enviada sea un numero
    if (isNaN(Number(quantity))) return res.sendBadRequest('The quantity has to be a number');

    // Si paso el parametro qty para modificar
    if (isNaN(quantity) || quantity < 0) {
      return res.sendBadRequest('Quantity should be a valid value');
    }
    // Hago un update del cart , enviando el products y el cid
    const up = await cartService.updateQtyCartService(cid, checkIdProduct, quantity);
    logger.logger.info('The Product with the quantity  specified has been added successfully', up);

    return res.sendSuccess('The Product with the quantity  specified has been added successfully');

  } catch (error) {
    done(error)
  }
};

const deleteProductInCart = async (req, res, done) => {
  const { cid, pid } = req.params;
  try {
    // Si no se envia ningun id de carrito
    if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
      {
        ErrorService.createError({
          name: 'Cart input error',
          cause: cartsInvalidValue(req.params),
          message: 'Please enter a valid cart ID',
          code: EErrors.INVALID_VALUE,
          status: 400
        })
      }
    }
    // Busco el Id del carrito en carts
    const cart = await cartService.getCartByIdService({ _id: cid });

    // Si no se encuentra el carrito en carts
    if (!cart) {
      return res.sendBadRequest('Cart not found');
    }

    if (cart.products.length === 0) {
      return res.sendBadRequest('The cart is empty');
    }

    // Si no se envia ningun pid
    if (!pid) {
      return res.sendBadRequest('Please enter a valid product ID');
    }

    // Busco el pid en el carrito
    const productIndex = cart.products.findIndex((product) => {
      const productId = product.product._id.toString();
      logger.logger.info('productindex', productId);
      return productId === pid;
    });

    // Si no encuentro el producto en el array
    if (productIndex === -1) {
      return res.sendBadRequest('Product not found in the cart');
    }
    //Si encuentro el producto en el array lo borro
    cart.products.splice(productIndex, 1);
    // Hago el update en el carrito
    logger.logger.debug(pid);
    const cartWithoutProducts = await cartService.deleteProductInCartService(cid, pid);
    // Envia un success response con el update del carrito
    return res.status(200).send({ status: 'success', message: `Product with ID ${pid} removed from the cart`, cart }); 

  } catch (error) {
    done(error)
  }
};

const deleteCart = async (req, res, done) => {
  const { cid } = req.params;

  try {
    // Si no se envia ningun id de carrito
    if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
      ErrorService.createError({
        name: 'Cart input error',
        cause: cartsInvalidValue(req.params),
        message: 'Please enter a valid cart ID',
        code: EErrors.INCOMPLETE_VALUES,
        status: 400
      })
    } else {
      // Busco el Id del carrito en carts
      const cart = await cartService.getCartByIdService({ _id: cid });
      logger.logger.debug(cart);

      // Si no se encuentra el carrito en carts
      if (!cart) {
        return res.sendBadRequest('Cart not found');
      }

      if (cart.products.length === 0) {
        return res.sendBadRequest('The cart is already empty')
      }
      //Update el carrito con un array vacio
      await cartService.emptyCartService(cid);
      // Send a success response
      return res.sendSuccess('The cart is empty')
    }
  } catch (error) {
    done(error);
  }
};

const updateCart = async (req, res) => {

  try {
    const { cid } = req.params;
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: 'Products must be an array' });//cambiar el response
    }
    // Busco el cart
    const cart = await cartService.getCartByIdService(cid);
    let productFound = false;
    let updatedProducts = [];
    // Para cada producto que envio en el body para modificar
    products.forEach(async (product) => {
      const productId = product.pid;
      // Busco el producto en el cart
      const cartProduct = cart.products.find(
        (cartProduct) =>
          cartProduct.product &&
          cartProduct.product._id &&
          cartProduct.product._id.toString() === productId
      );

      //Si el producto no se encuentra
      if (!cartProduct) {
        logger.logger.error('Product not found in cart');
      } else {
        productFound = true;
        logger.logger.info('Product found');
        //Si se encuentra lo pusheo a un nuevo array
        updatedProducts.push(product);
      }
    });

    //Si no se envia ningun producto a actualizar
    if (!productFound) {
      return res.sendBadRequest('There are no products matching those id/s ');
    }
    // Updateo el cart con los nuevos valores
    const updatedCart = await cartService.updateProductsInCartService(cid, updatedProducts);
    res.sendSuccessWithPayload({ message: 'Cart updated successfully', cart: updatedCart });

  } catch (err) {
    res.sendInternalError('Internal server error', err);
  }
};

const updateQtyProductInCart = async (req, res, done) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
      return res.sendBadRequest('Please enter a valid cart ID');
    }
    const cart = await cartService.getCartByIdService({ _id: cid });

    if (!cart) {
      return res.sendNotFound({ status: 'error', message: 'Cart not found' });
    }

    if (cart.products.length === 0) {
      return res.sendBadRequest('The cart is empty');
    }

    if (!pid) {
      return res.sendBadRequest('Please enter a valid product ID');
    }

    if (quantity === undefined || quantity === '') {
      return res.sendBadRequest('Please send a new value to update');
    }

    if (isNaN(quantity)) {
      return res.sendBadRequest('Quantity should be a valid value');
    }
    const productToUpdate = cart.products.find(product => product.product._id.toString() === pid);

    if (!productToUpdate) {
      return res.status(404).send({ status: 'error', message: 'Product not found in the cart' });
    }

    //Si la cantidad que envio desde el front es negativa y la cantidad del producto es>0 o la la cantidad que envio desde el front es positiva entonces actualizo las cantidades
    if (Number(quantity) < 0 && productToUpdate.quantity > 0 || Number(quantity) > 0) {
      productToUpdate.quantity = Number(quantity);
      console.log(productToUpdate.quantity)
      const cartUpd = await cartService.updateQtyCartService(cid, pid, quantity);
      await cartUpd.save();
      logger.logger.info(JSON.stringify(cartUpd, null, '\t'));
      return res.sendSuccess('Product updated successfully');
    }

  } catch (error) {
    logger.logger.error(error);
    return res.sendBadRequest('Product could not be updated');
  }
};

const checkoutCart = async (req, res) => {
  const { cid } = req.params;

  try {
    // Primero busco si existe el cart
    const cartExist = await cartService.getCartByIdService(cid);

    //Si el cart existe 
    if (cartExist) {
      const InCart = [];
      const Outstock = [];
      logger.logger.info(JSON.stringify(cartExist, null, '\t'));
      logger.logger.info('losincart', cartExist.products);
      // Checkeo si hay stock suficiente para comprar y lo guardo en un nuevo array
      Object.values(cartExist.products).forEach((product) => {
        if (product.quantity <= product.product.stock) {
          const subtotal = product.product.price * product.quantity;
          const newStockValue = product.product.stock - product.quantity;
          // Hago update del stock en mi DB
          const updatedProduct = productService.updateProductService(product.product._id, {
            $set: { stock: newStockValue },
          });
          let prod = {
            _id: product.product._id,
            name: product.product.title,
            price: product.product.price,
            quantity: product.quantity,
            subtotal,
          };
          InCart.push(prod);
          logger.logger.info('Empujar al arreglo Incart', InCart);
          //Si no hay suficiente stock lo empujo ala rreglo Outstock
        } else {
          let outstockProduct = {
            _id: product.product._id,
            name: product.product.title,
            price: product.product.price,
            quantity: product.quantity,
          };
          Outstock.push(outstockProduct);
          logger.logger.info('Empujar al arreglo Outstock', Outstock);
        }
      });

      //A los productos InCart los voy filtrando llamando a la funcion deleteProductInCartService y los voy sacando del cart
      for (const product of InCart) {
        logger.logger.debug(cid)
        logger.logger.debug(product._id.toString())
        const ver = await cartService.deleteProductInCartService(cid, product._id.toString());
      }
      
      // Ahora Obtengo el total del cart
      let totalProduct = 0;
      InCart.forEach((subtotal) => {
        totalProduct += subtotal.subtotal;
      });
      let ticket = null;
      //Si en el arreglo Incart hay productos genero el ticket de compra con esos mismos
      if (InCart.length != 0) {
        // Create the ticket
        ticket = new ticketModel({
          code: uuidv4(),
          amount: totalProduct,
          purchaser: req.user.email,
        });
        await ticket.save();
      }
      //Genero el CheckoutTicket model donde va a incluir el ticket generado los porductos que se compraron(InCart) y los que quedaorn fuera de la compra(OutCart)
      const checkOutTicket = new checkoutTicketModel({
        cid: cid,
        ticket: ticket,
        InCart: InCart,
        Outstock: Outstock,
      });
      await checkOutTicket.save();
      logger.logger.info('check', checkOutTicket);
      return res.status(200).json(checkOutTicket);
    }

  } catch (error) {
    logger.logger.error('Error:', error);
    return res.sendBadRequest('Purchase could not be completed');
  }
};

const checkoutDisplay = async (req, res) => {
  const { cid } = req.params;

  //Busco el usuario
  const userExist =  await userService.getUserByService({ cart: cid })
  const userEmail = userExist.email

  try {
    const ticketData = await checkoutTicketModel
      .findOne({ cid: cid })
      .sort({ _id: -1 }) // Me va a traer el ultimo ticket que encuentra para hacer display
      .populate('ticket')
      .lean()
      .exec();

      if(ticketData.ticket.code){

        const secompraronInfo = ticketData.InCart.map(product => {
          return `- Name: ${product.name} - Price: ${product.price} - Quantity: ${product.quantity}\n`;
        }).join('');

        const outOfStock = ticketData.Outstock.map(product => {
          return `- Name: ${product.name} - Quantity: ${product.quantity}\n`;
        }).join('');

        const result = await transport.sendMail({
          from: 'Luli Store <config.app.email>',
          to: userEmail,
          subject: `Su orden de compra es ${ticketData.ticket.code}`,
          html: `
          <div>
          <h1>Orden de compra ${ticketData.ticket.code}</h1>
          <h2>Su orden de compra incluye los siguientes productos :</h2>
          <ul>
          ${secompraronInfo}
          </ul>
          <h2>Los siguientes productos están fuera de stock y no pudieron ser procesados:</h2>
          <ul>
            ${outOfStock}
          </ul>
        </div>
    `,
        });
        console.log(`Email sent to: ${userEmail}`);
      }


    return res.render('purchase', { checkoutTicket: ticketData });






  } catch (error) {
    logger.logger.error('Error:', error);
    return res.sendBadRequest('Purchase could not be completed');
  }


};


export default {
  addProductToCart,
  getCartById,
  postProductInCart,
  deleteProductInCart,
  deleteCart,
  updateCart,
  updateQtyProductInCart,
  checkoutCart,
  checkoutDisplay
}




